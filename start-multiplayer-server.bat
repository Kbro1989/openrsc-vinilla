@echo off
REM Add Node.js to PATH
set "PATH=C:\Users\Destiny\AppData\Local\nvm\v20.19.6;%PATH%"

echo ========================================
echo   RSC Local Multiplayer Server
echo ========================================
echo.
echo Starting server on port 43594...
echo Players connect at: ws://localhost:43594
echo.

cd rsc-server
node multiplayer-server.js
pause
