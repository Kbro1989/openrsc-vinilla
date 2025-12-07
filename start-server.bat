@echo off
REM Add Node.js from nvm to PATH
set "PATH=C:\Users\Destiny\AppData\Local\nvm\v20.19.6;%PATH%"

echo Starting Cloudflare Pages Dev Server with KV...
npx wrangler pages dev public --port 8790 --kv KV
