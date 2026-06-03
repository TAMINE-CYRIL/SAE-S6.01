# ── Frugal AI — Setup complet (nouveau PC ou réinitialisation) ──────────────
# Usage : depuis backend/scripts/  ->  .\setup.ps1
# Prérequis : Docker Desktop installé et lancé
#
# Ce script vit dans backend/scripts/ ; le docker-compose.yml est dans backend/ (parent).

Set-StrictMode -Off
$ErrorActionPreference = "Continue"

$BACKEND = Split-Path $PSScriptRoot -Parent          # ...\backend
$COMPOSE = Join-Path $BACKEND "docker-compose.yml"
$ROOT    = Split-Path $BACKEND -Parent               # racine du projet

Write-Host ""
Write-Host "=== Frugal AI Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier Docker
try {
    docker info 2>&1 | Out-Null
    Write-Host "[OK] Docker accessible" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker non accessible. Lancez Docker Desktop puis relancez." -ForegroundColor Red
    exit 1
}

# 2. .env
$envPath    = Join-Path $BACKEND ".env"
$envExample = Join-Path $BACKEND ".env.example"
if (-not (Test-Path $envPath)) {
    if (Test-Path $envExample) { Copy-Item $envExample $envPath }
    Write-Host "[INFO] .env cree — adaptez OLLAMA_DATA_PATH et les cles Supabase" -ForegroundColor Yellow
}

# 3. Build + démarrage
Write-Host "Construction image OCR..." -ForegroundColor Cyan
docker compose -f $COMPOSE build ocr

Write-Host "Demarrage containers..." -ForegroundColor Cyan
docker compose -f $COMPOSE up -d

# 4. Modèles Ollama (alignés sur web/js/constants.js)
Write-Host "Attente Ollama..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 24; $i++) {
    try { $null = Invoke-RestMethod "http://localhost:11434/api/tags" -TimeoutSec 5; $ready = $true; break }
    catch { Start-Sleep 5 }
}

$models = @("mistral","nomic-embed-text","llama3.1","gemma2:2b","phi3","qwen2.5","deepseek-r1:1.5b")
if ($ready) {
    Write-Host "[OK] Ollama pret" -ForegroundColor Green
    $existing = (Invoke-RestMethod "http://localhost:11434/api/tags").models.name
    foreach ($m in $models) {
        if ($existing -contains $m -or $existing -contains "$m`:latest") {
            Write-Host "  [OK] $m" -ForegroundColor Green
        } else {
            Write-Host "  Telechargement $m ..." -ForegroundColor Yellow
            docker exec frugalai-ollama ollama pull $m
        }
    }
} else {
    Write-Host "[WARN] Ollama pas encore pret. Lancez manuellement :" -ForegroundColor Yellow
    foreach ($m in $models) { Write-Host "  docker exec frugalai-ollama ollama pull $m" }
}

# 5. Résumé
Write-Host ""
Write-Host "=== Services ===" -ForegroundColor Cyan
docker ps --filter "name=frugalai" --format "  {{.Names}}: {{.Status}}"
Write-Host ""
Write-Host "[DONE] Setup termine" -ForegroundColor Green
Write-Host "  n8n    : http://localhost:5678"
Write-Host "  OCR    : http://localhost:3100/health"
Write-Host "  Site   : cd `"$ROOT\web`" ; python -m http.server 8080"
