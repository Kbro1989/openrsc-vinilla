@echo off
set "NODE_HOME=%~dp0local-node"
set "PATH=%NODE_HOME%;%PATH%"
echo Using Portable Node.js from: %NODE_HOME%
node -v
npm -v
cmd /k
