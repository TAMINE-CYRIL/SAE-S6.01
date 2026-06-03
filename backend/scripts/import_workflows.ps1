# ── Frugal AI — Import des workflows n8n + application des patches ───────────
# Importe les 3 workflows (A ingestion RAG, B frugaliste, C replay) dans n8n,
# puis applique les patches (prompts, scoring, personas, perfs, RAG).
#
# Prerequis :
#   - Conteneur frugalai-n8n demarre
#   - Le compte proprietaire n8n a deja ete cree (http://localhost:5678 au 1er lancement)
# Usage : depuis backend/scripts/  ->  .\import_workflows.ps1

Set-StrictMode -Off
$ErrorActionPreference = "Continue"

$N8N_DIR   = Join-Path (Split-Path $PSScriptRoot -Parent) "n8n"
$CONTAINER = "frugalai-n8n"

Write-Host ""
Write-Host "=== Frugal AI : import des workflows n8n ===" -ForegroundColor Cyan

# 1. Conteneur present ?
$running = docker ps --filter "name=$CONTAINER" --format "{{.Names}}" 2>$null
if (-not $running) {
    Write-Host "[ERREUR] Conteneur '$CONTAINER' introuvable. Demarrez la stack backend d'abord (setup.ps1)." -ForegroundColor Red
    exit 1
}

# 2. Recuperer l'id du proprietaire n8n (sqlite3 CLI absent du conteneur -> via node)
$nodeExpr = "const s=require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3').verbose();const db=new s.Database('/home/node/.n8n/database.sqlite');db.get('SELECT id FROM user ORDER BY createdAt LIMIT 1',(e,r)=>{console.log(r&&r.id?r.id:'NONE');db.close();});"
$userId = (docker exec $CONTAINER node -e $nodeExpr 2>$null | Select-Object -First 1).Trim()

if (-not $userId -or $userId -eq "NONE") {
    Write-Host "[ACTION REQUISE] Aucun compte n8n trouve." -ForegroundColor Yellow
    Write-Host "  1. Ouvrez http://localhost:5678 et creez le compte proprietaire." -ForegroundColor Yellow
    Write-Host "  2. Relancez ce script." -ForegroundColor Yellow
    exit 1
}
Write-Host "Proprietaire n8n : $userId" -ForegroundColor DarkGray

# 3. Copier les exports dans un dossier propre du conteneur, puis importer
docker exec $CONTAINER sh -c "rm -rf /tmp/wf && mkdir -p /tmp/wf" | Out-Null
Get-ChildItem "$N8N_DIR\*.json" | ForEach-Object {
    docker cp $_.FullName "${CONTAINER}:/tmp/wf/$($_.Name)" | Out-Null
    Write-Host "  copie $($_.Name)" -ForegroundColor DarkGray
}
Write-Host "Import dans n8n..." -ForegroundColor Cyan
docker exec $CONTAINER n8n import:workflow --separate --input=/tmp/wf --userId=$userId

# 4. Appliquer les patches (B : prompts/scoring/personas/perfs ; A : ingestion RAG)
Write-Host "Application des patches..." -ForegroundColor Cyan
foreach ($p in @("patch_workflow.js", "patch_workflow_A.js")) {
    $path = Join-Path $PSScriptRoot $p
    if (-not (Test-Path $path)) { Write-Host "  [WARN] $p introuvable" -ForegroundColor Yellow; continue }
    docker cp $path "${CONTAINER}:/tmp/$p" | Out-Null
    docker exec $CONTAINER node "/tmp/$p" | Select-String -Pattern "OK:|entity:|history:|ERR" | Select-Object -First 12
    Write-Host "  [OK] $p applique" -ForegroundColor Green
}

# 5. Redemarrer n8n pour recharger les workflows patches
Write-Host "Redemarrage n8n..." -ForegroundColor Cyan
docker restart $CONTAINER | Out-Null

Write-Host ""
Write-Host "[DONE] Workflows importes et patches." -ForegroundColor Green
Write-Host "  Verifiez sur http://localhost:5678 que les 3 workflows sont ACTIVES" -ForegroundColor Yellow
Write-Host "  (Workflow B et C doivent etre actifs pour repondre aux webhooks)." -ForegroundColor Yellow
