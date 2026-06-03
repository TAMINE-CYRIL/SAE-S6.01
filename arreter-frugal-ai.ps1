Set-StrictMode -Off
$ErrorActionPreference = "Continue"
$ROOT = Split-Path $MyInvocation.MyCommand.Path -Parent

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "        Frugal AI - Arret         " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# -- 1. Serveur web (python http.server :8080)
Write-Host "[1/3] Serveur web..." -ForegroundColor Yellow
$stopped = $false
Get-CimInstance Win32_Process -Filter "Name='python.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'http\.server' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $stopped = $true }
if ($stopped) { Write-Host "      [OK] Serveur web arrete" -ForegroundColor Green }
else          { Write-Host "      [OK] Aucun serveur web a arreter" -ForegroundColor Green }

# -- 2. Stack Frugal AI (n8n + OCR + Ollama)
Write-Host "[2/3] Stack Frugal AI (n8n, OCR, Ollama)..." -ForegroundColor Yellow
$dockerOk = $false
try { docker info 2>&1 | Out-Null; $dockerOk = ($LASTEXITCODE -eq 0) } catch {}
if ($dockerOk) {
    docker compose -f "$ROOT\backend\docker-compose.yml" stop 2>&1 | Where-Object { $_ -match "Stopp|Stopped|Error" } | ForEach-Object { Write-Host "      $_" }
    Write-Host "      [OK] Stack Frugal AI arretee" -ForegroundColor Green
} else {
    Write-Host "      [INFO] Docker non disponible - rien a arreter" -ForegroundColor DarkYellow
}

# -- 3. Supabase
Write-Host "[3/3] Supabase..." -ForegroundColor Yellow
if ($dockerOk) {
    docker compose -f "$ROOT\supabase-local\docker\docker-compose.yml" stop 2>&1 | Where-Object { $_ -match "Stopp|Stopped|Error" } | Select-Object -Last 5 | ForEach-Object { Write-Host "      $_" }
    Write-Host "      [OK] Supabase arrete" -ForegroundColor Green
} else {
    Write-Host "      [INFO] Docker non disponible" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "        Tout est arrete !        " -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "  Les conteneurs sont stoppes (pas supprimes) : relance rapide via lancer-frugal-ai.ps1"
Write-Host "  Docker Desktop reste ouvert (fermeture manuelle si besoin)."
Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
