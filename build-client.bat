@echo off
set "LOCAL_NODE=%~dp0local-node"
set "PATH=%LOCAL_NODE%;%PATH%"

echo Building RSC Client...
cd rsc-client
call npm install
call npm run build-dev

echo Copying to public...
copy dist\index.bundle.js ..\public\index.bundle.js /Y

echo Done!
