# SquadSync Database Initialization Script (PowerShell)
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

$venvPython = Join-Path $scriptDir "backend\.venv\Scripts\python.exe"
$setupScript = Join-Path $scriptDir "backend\setup_database.py"

Write-Host "`n[*] Starting SquadSync PostgreSQL Database Setup..." -ForegroundColor Cyan

if (Test-Path $venvPython) {
    & $venvPython $setupScript $args
} else {
    python $setupScript $args
}
