param()

$scriptPath = Join-Path $PSScriptRoot "scripts/dev.ps1"
If (-Not (Test-Path $scriptPath)) {
    Write-Error "Could not find $scriptPath"
    exit 1
}
& $scriptPath @args
