@echo off
set "LOCAL_NODE=%~dp0local-node"
if exist "%LOCAL_NODE%\node.exe" (
    echo Found Portable Node.js. Using it...
    set "PATH=%LOCAL_NODE%;%PATH%"
)

echo Checking for Node.js...
node -v
if %errorlevel% neq 0 (
    echo Node.js not found in PATH.
    echo Please run 'powershell -ExecutionPolicy Bypass -File setup-portable-node.ps1' to install a portable version.
    pause
    exit /b 1
)

echo Starting Cloudflare Pages Dev Server (if not running)...
echo NOTE: You should have 'npx wrangler pages dev public' running in another terminal.
echo If not, this script might fail to connect.

echo Running Verification Script...
node scripts/verify-login-pipeline.js
pause
