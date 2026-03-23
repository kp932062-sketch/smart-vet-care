<#
.SYNOPSIS
    Starts the entire SmartVet / VetCare website in one command.
    Usage:  powershell -ExecutionPolicy Bypass -File start-vetcare.ps1

.DESCRIPTION
    Starts: Local MySQL (port 3307) → Backend (port 5000) → Frontend (port 5173)
    Also seeds 5 sample doctors so the booking page is not empty.
#>

Set-StrictMode -Off
$ErrorActionPreference = 'Stop'
$Root        = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir  = Join-Path $Root 'backend'
$FrontendDir = Join-Path $Root 'frontend'
$LogDir      = Join-Path $Root 'runtime-logs'
$StartMysqlScript = Join-Path $Root 'start-local-mysql.ps1'
$BackendEnvPath = Join-Path $BackendDir '.env'

function Write-Step { param([string]$M) Write-Host "`n  >> $M" -ForegroundColor Cyan }
function Write-OK   { param([string]$M) Write-Host "  OK  $M" -ForegroundColor Green }
function Write-Warn { param([string]$M) Write-Host "  !!  $M" -ForegroundColor Yellow }
function Write-Fail { param([string]$M) Write-Host "  XX  $M" -ForegroundColor Red }
function Get-EnvValue {
    param(
        [string]$Path,
        [string]$Key
    )

    if (-not (Test-Path $Path)) {
        return $null
    }

    $line = Get-Content $Path | Where-Object { $_ -match "^$Key=" } | Select-Object -First 1
    if (-not $line) {
        return $null
    }

    return ($line -replace "^$Key=", '').Trim()
}

Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "   SmartVet / VetCare Startup Script   " -ForegroundColor Magenta
Write-Host "=======================================`n" -ForegroundColor Magenta

# ── 1. Ensure directories ────────────────────────────────────
New-Item -ItemType Directory -Path $LogDir  -Force | Out-Null

# ── 2. Local MySQL bootstrap (isolated instance) ─────────────
Write-Step "Starting isolated local MySQL instance..."
if (-not (Test-Path $StartMysqlScript)) {
    Write-Fail "Missing script: $StartMysqlScript"
    exit 1
}

try {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $StartMysqlScript
    Write-OK "Local MySQL is ready on port 3310"
} catch {
    Write-Fail "Failed to start local MySQL: $($_.Exception.Message)"
    exit 1
}

# ── 3. Seed doctors ──────────────────────────────────────────
Write-Step "Seeding sample doctors..."
try {
    $output = & node "$BackendDir\seed-doctors.js" 2>&1
    $output | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkGray }
    Write-OK "Doctor seeding done"
} catch {
    Write-Warn "Seed warning (non-fatal): $($_.Exception.Message)"
}

# ── 4. Start Backend ─────────────────────────────────────────
Write-Step "Starting Backend on port 5000..."
Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/k', "title SmartVet Backend && cd /d `"$BackendDir`" && node server.js" `
    -WindowStyle Normal | Out-Null

Write-Warn "Waiting up to 15s for backend health..."
$backendUp = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5000/api/health' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $backendUp = $true; break }
    } catch { }
}

if ($backendUp) {
    Write-OK "Backend is healthy at http://localhost:5000"
} else {
    Write-Warn "Backend health check timed out. Check the 'SmartVet Backend' window for errors."
}

# ── 5. Seed doctors AFTER backend is up (DB schema is ready) ─
Write-Step "Seeding sample doctors..."
# Give backend an extra moment to finish schema migration
Start-Sleep -Seconds 2
try {
    $output = & node "$BackendDir\seed-doctors.js" 2>&1
    $output | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkGray }
    Write-OK "Doctor seeding done"
} catch {
    Write-Warn "Seed warning (non-fatal): $($_.Exception.Message)"
}

# ── 6. Start Frontend ────────────────────────────────────────
Write-Step "Starting Frontend on port 5173..."
Start-Process -FilePath 'cmd.exe' `
    -ArgumentList '/k', "title SmartVet Frontend && cd /d `"$FrontendDir`" && npm run dev" `
    -WindowStyle Normal | Out-Null

Write-Warn "Waiting up to 12s for Vite..."
$frontendUp = $false
for ($i = 0; $i -lt 12; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -lt 400) { $frontendUp = $true; break }
    } catch { }
}

if ($frontendUp) {
    Write-OK "Frontend ready at http://localhost:5173"
} else {
    Write-Warn "Frontend not ready yet. Check 'SmartVet Frontend' window. Opening anyway..."
}

# ── 6. Open browser ──────────────────────────────────────────
Start-Sleep -Seconds 2
Start-Process 'http://localhost:5173'

# ── 7. Summary ───────────────────────────────────────────────
$adminEmail = Get-EnvValue -Path $BackendEnvPath -Key 'ADMIN_EMAIL'
$adminPassword = Get-EnvValue -Path $BackendEnvPath -Key 'ADMIN_PASSWORD'

Write-Host "`n=======================================" -ForegroundColor Magenta
Write-Host "   Site is running!                    " -ForegroundColor Magenta
Write-Host "=======================================" -ForegroundColor Magenta
Write-Host "  Frontend  : http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend   : http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "  Database  : 127.0.0.1:3310 (smartvet)" -ForegroundColor Cyan
Write-Host "  Admin URL : http://localhost:5173/admin-login" -ForegroundColor Cyan
if ($adminEmail -and $adminPassword) {
    Write-Host "  Admin     : $adminEmail / $adminPassword" -ForegroundColor Yellow
} else {
    Write-Warn "Admin credentials not found in backend/.env (ADMIN_EMAIL / ADMIN_PASSWORD)."
}
Write-Host "---------------------------------------" -ForegroundColor DarkGray
Write-Host "  Close the two console windows to stop." -ForegroundColor DarkGray
Write-Host ""
