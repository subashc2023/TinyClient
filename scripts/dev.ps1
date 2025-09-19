[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"
$envFile = Join-Path $repoRoot ".env"

Write-Host "Starting TinyClient dev environment" -ForegroundColor Cyan
Write-Host ("Repository root:`t{0}" -f $repoRoot)

if (Test-Path $envFile) {
    Write-Host "Loading environment variables from .env" -ForegroundColor Yellow
    foreach ($line in Get-Content $envFile) {
        $trimmed = $line.Trim()
        if (-not $trimmed -or $trimmed.StartsWith('#')) { continue }
        $parts = $trimmed -split '=', 2
        if ($parts.Count -ne 2) { continue }
        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"').Trim("'")
        try {
            Set-Item -Path ("Env:" + $name) -Value $value
        } catch {
            Write-Warning "Skipped invalid env var entry: $name"
        }
    }
}

Write-Host "Syncing backend dependencies (uv sync)" -ForegroundColor Yellow
Push-Location $backendDir
try {
    & uv sync | Out-Host
} finally {
    Pop-Location
}

Write-Host "Installing frontend dependencies (bun install)" -ForegroundColor Yellow
Push-Location $frontendDir
try {
    & bun install | Out-Host
    Write-Host "Building email templates (bun run emails:build)" -ForegroundColor Yellow
    & bun run emails:build | Out-Host
} finally {
    Pop-Location
}

Write-Host "Applying database migrations" -ForegroundColor Yellow
Push-Location $backendDir
try {
    & uv run python -m app.setup migrate | Out-Host
    if ($env:ADMIN_EMAIL -and $env:ADMIN_USERNAME -and $env:ADMIN_PASSWORD) {
        Write-Host "Seeding database users" -ForegroundColor Yellow
        & uv run python -m app.setup seed | Out-Host
    }
} finally {
    Pop-Location
}

$backendCommand = "Set-Location `"$backendDir`"; uv run python -m app.main"
$frontendCommand = "Set-Location `"$frontendDir`"; bun run dev"

Write-Host "Launching backend server window" -ForegroundColor Green
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $backendCommand | Out-Null

Write-Host "Launching frontend dev window" -ForegroundColor Green
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', $frontendCommand | Out-Null

Write-Host "Backend and frontend should now be running in separate windows." -ForegroundColor Cyan
Write-Host "Use Ctrl+C in those windows to stop the servers." -ForegroundColor Cyan

