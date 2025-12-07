@echo off
echo Building Durable Object Worker...

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call ..\local-node\nodevars.bat
    call npm install
)

:: Run build
echo Running esbuild...
call ..\local-node\nodevars.bat
call node build.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Build successful!
    echo Output: dist\worker.js
) else (
    echo.
    echo ✗ Build failed!
    exit /b 1
)
