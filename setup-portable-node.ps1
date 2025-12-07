$ErrorActionPreference = "Stop"
$NodeVersion = "v20.10.0"
$NodeDist = "node-$NodeVersion-win-x64"
$ZipName = "$NodeDist.zip"
$Url = "https://nodejs.org/dist/$NodeVersion/$ZipName"
$InstallDir = Join-Path $PSScriptRoot "local-node"

Write-Host "Detected persistent Node.js deletion issues."
Write-Host "Attempting to install Portable Node.js ($NodeVersion) to: $InstallDir"

if (Test-Path $InstallDir) {
    Write-Host "Cleaning up existing installation..."
    Remove-Item $InstallDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$ZipPath = Join-Path $InstallDir $ZipName

if (-not (Test-Path $ZipPath)) {
    Write-Host "Downloading $Url..."
    Invoke-WebRequest -Uri $Url -OutFile $ZipPath
}

Write-Host "Extracting..."
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force

# Move contents up if nested
$NestedDir = Join-Path $InstallDir $NodeDist
if (Test-Path $NestedDir) {
    Get-ChildItem -Path $NestedDir | Move-Item -Destination $InstallDir -Force
    Remove-Item $NestedDir -Recurse -Force
}

# Create a helper batch file to use this node
$BatchContent = @"
@echo off
set "NODE_HOME=%~dp0local-node"
set "PATH=%NODE_HOME%;%PATH%"
echo Using Portable Node.js from: %NODE_HOME%
node -v
npm -v
cmd /k
"@

$BatchPath = Join-Path $PSScriptRoot "start-dev-env.bat"
Set-Content -Path $BatchPath -Value $BatchContent

Write-Host "Done!"
Write-Host "Run 'start-dev-env.bat' to open a terminal with this Node.js version active."
