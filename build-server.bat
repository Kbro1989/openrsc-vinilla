@echo off
set "LOCAL_NODE=%~dp0local-node"
set "PATH=%LOCAL_NODE%;%PATH%"

echo Building RSC Server (Browser Bundle)...
cd rsc-server
call npm install
call npm run build-browser

echo Copying to public...
copy dist\browser.bundle.min.js ..\public\server.bundle.min.js /Y

echo Done!
