# ── Frugal AI — Initialisation de la base Supabase ───────────────────────────
# Applique le schema (tables + pgvector) et les fonctions RPC sur la base
# PostgreSQL de Supabase local (conteneur supabase-db).
# Idempotent : rejouable sans risque (CREATE ... IF NOT EXISTS / OR REPLACE).
#
# Prerequis : Supabase local demarre (conteneur supabase-db en cours).
# Usage : depuis backend/scripts/  ->  .\init_supabase.ps1

Set-StrictMode -Off
$ErrorActionPreference = "Continue"

$SQL_DIR   = Join-Path (Split-Path $PSScriptRoot -Parent) "sql"
$CONTAINER = "supabase-db"

Write-Host ""
Write-Host "=== Frugal AI : init base Supabase ===" -ForegroundColor Cyan

# Verifier que le conteneur tourne
$running = docker ps --filter "name=$CONTAINER" --format "{{.Names}}" 2>$null
if (-not $running) {
    Write-Host "[ERREUR] Conteneur '$CONTAINER' introuvable. Demarrez Supabase local d'abord." -ForegroundColor Red
    Write-Host "         (cd supabase-local\docker ; docker compose up -d)" -ForegroundColor Red
    exit 1
}

foreach ($f in @("01_schema.sql", "02_functions.sql")) {
    $path = Join-Path $SQL_DIR $f
    if (-not (Test-Path $path)) { Write-Host "[WARN] $f introuvable, ignore" -ForegroundColor Yellow; continue }
    Write-Host "Application de $f ..." -ForegroundColor Cyan
    docker cp $path "${CONTAINER}:/tmp/$f" | Out-Null
    docker exec $CONTAINER psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f "/tmp/$f"
    if ($LASTEXITCODE -eq 0) { Write-Host "  [OK] $f applique" -ForegroundColor Green }
    else { Write-Host "  [ERREUR] echec sur $f" -ForegroundColor Red }
}

Write-Host ""
Write-Host "[DONE] Tables : sessions, messages, scores, chunks (+ pgvector, fonctions RPC)" -ForegroundColor Green
