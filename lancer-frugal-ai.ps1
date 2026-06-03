Set-StrictMode -Off
$ErrorActionPreference = "Continue"
$ROOT = Split-Path $MyInvocation.MyCommand.Path -Parent

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "       Frugal AI - Demarrage      " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# -- 1. Docker Desktop
Write-Host "[1/4] Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = $false
try { docker info 2>&1 | Out-Null; $dockerRunning = ($LASTEXITCODE -eq 0) } catch {}

if (-not $dockerRunning) {
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    Write-Host "      Attente de Docker (peut prendre 30-60s)..."
    for ($i = 0; $i -lt 36; $i++) {
        Start-Sleep 5
        try { docker info 2>&1 | Out-Null; if ($LASTEXITCODE -eq 0) { $dockerRunning = $true; break } } catch {}
        Write-Host ("      ..." + (($i + 1) * 5) + "s")
    }
}

if (-not $dockerRunning) {
    Write-Host "[ERREUR] Docker non disponible apres 3 minutes." -ForegroundColor Red
    Write-Host "         Lancez Docker Desktop manuellement puis relancez ce script." -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}
Write-Host "      [OK] Docker pret" -ForegroundColor Green

# -- 2. Stack Frugal AI (n8n + OCR + Ollama)
Write-Host "[2/4] Stack Frugal AI (n8n, OCR, Ollama)..." -ForegroundColor Yellow
docker compose -f "$ROOT\backend\docker-compose.yml" up -d 2>&1 | Where-Object { $_ -match "Started|Running|Created|Error" } | ForEach-Object { Write-Host "      $_" }
Write-Host "      [OK] Stack Frugal AI" -ForegroundColor Green

# -- 3. Supabase
Write-Host "[3/4] Supabase..." -ForegroundColor Yellow
docker compose -f "$ROOT\supabase-local\docker\docker-compose.yml" up -d 2>&1 | Where-Object { $_ -match "Started|Running|Created|Healthy|Error" } | Select-Object -Last 5 | ForEach-Object { Write-Host "      $_" }
Write-Host "      [OK] Supabase" -ForegroundColor Green

# -- 4. Serveur web
Write-Host "[4/4] Serveur web..." -ForegroundColor Yellow
$portUsed = netstat -ano 2>$null | Select-String ":8080 "
if ($portUsed) {
    Write-Host "      [OK] Port 8080 deja actif" -ForegroundColor Green
} else {
    $cmd = "Set-Location '" + $ROOT + "\web'; python -m http.server 8080"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd
    Start-Sleep 2
    Write-Host "      [OK] Serveur web lance" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "         Tout est lance !        " -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "  Site     -> http://localhost:8080"
Write-Host "  n8n      -> http://localhost:5678"
Write-Host "  Supabase -> http://localhost:3000"
Write-Host ""

Start-Process "http://localhost:8080"

Write-Host "Note : Le premier appel IA peut prendre 60-90s (chargement du modele)." -ForegroundColor DarkYellow
Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
