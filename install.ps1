# install.ps1 — Add dsh-usage-glm-cn to the DSH web profile (Windows PowerShell)
$ProfileDir = if ($env:DSH_PROFILE_DIR) { $env:DSH_PROFILE_DIR } else { "$env:USERPROFILE\.dsh\profiles" }

if (-not (Test-Path $ProfileDir)) {
    Write-Error "DSH profile directory not found at $ProfileDir"
    Write-Error "Set `$env:DSH_PROFILE_DIR to your profile directory and try again."
    exit 1
}

Set-Location $ProfileDir
npm install dsh-usage-glm-cn --save --registry=https://registry.npmjs.org

Write-Host ""
Write-Host "Installed. Add the following entry to cordis.patch.yml:"
Write-Host ""
Write-Host "  - type: insert"
Write-Host "    plugin: dsh-usage-glm-cn"
Write-Host "    id: glm-cn-usage"
Write-Host ""
Write-Host "Then restart DSH or reload the profile."
