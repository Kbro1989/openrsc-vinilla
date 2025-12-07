# Durable Objects Deployment Guide

## Current Status

✅ **Completed:**
- Durable Object Worker structure created (`durable-objects/`)
- `RSCServerDO` class implemented with WebSocket handling
- Server code updated to support Durable Object mode
- Browser Data Client updated for direct KV access
- Pages Function proxy created (`/functions/api/server.js`)
- Configuration files updated (wrangler.toml, package.json)

⚠️ **Known Issue:**
The RSC Server codebase uses CommonJS (`module.exports`, `require()`), but Cloudflare Durable Objects Workers require ES Modules (`export`, `import`). This needs to be resolved before deployment.

---

## Solution: Bundle the Durable Object Worker

The recommended approach is to bundle the Durable Object Worker using **esbuild**, which will:
1. Convert CommonJS to ES Modules automatically
2. Bundle all dependencies into a single file
3. Make the code compatible with Cloudflare Workers runtime

### Steps to Add Bundling

#### 1. Install esbuild in durable-objects directory

```bash
cd durable-objects
npm init -y
npm install --save-dev esbuild
```

#### 2. Create build script

Create `durable-objects/build.js`:

```javascript
const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./index.js'],
    bundle: true,
    outfile: './dist/worker.js',
    format: 'esm',
    platform: 'browser',
    target: 'es2021',
    external: [],
    minify: false, // Set to true for production
    sourcemap: true
}).catch(() => process.exit(1));
```

#### 3. Update durable-objects/package.json

```json
{
  "name": "rsc-server-do",
  "version": "1.0.0",
  "scripts": {
    "build": "node build.js",
    "deploy": "npm run build && wrangler deploy"
  },
  "devDependencies": {
    "esbuild": "^0.19.0"
  }
}
```

#### 4. Update durable-objects/wrangler.toml

Change the main entry point to the bundled file:

```toml
name = "rsc-server-do"
main = "dist/worker.js"  # Changed from "index.js"
compatibility_date = "2024-11-28"

[[kv_namespaces]]
binding = "KV"
id = "f2881801ac59415a86236d0841f27103"

[[durable_objects.bindings]]
name = "RSC_SERVER"
class_name = "RSCServerDO"

[[migrations]]
tag = "v1"
new_classes = ["RSCServerDO"]
```

#### 5. Update root package.json scripts

```json
{
  "scripts": {
    "build:do": "cd durable-objects && npm install && npm run build && wrangler deploy",
    "deploy": "npm run build && npm run build:do && wrangler pages deploy public"
  }
}
```

---

## Deployment Steps

### Step 1: Build and Deploy Durable Object Worker

The Durable Object Worker must be deployed **first** and **separately** from Pages:

```bash
cd durable-objects
npm install
npm run build
wrangler deploy
```

This will:
- Bundle the RSC server and DO Worker into a single ES Module
- Deploy it to Cloudflare as `rsc-server-do`
- Create the `RSCServerDO` Durable Object class

> **Note:** This step is **required before** deploying Pages, as Pages needs to bind to the existing DO Worker.

### Step 2: Bind Durable Object to Pages Project

The binding is already configured in the root `wrangler.toml`. Ensure it's also set in Cloudflare Dashboard:

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Settings → Functions → Durable Object Bindings
3. Add binding: `RSC_SERVER` → `RSCServerDO@rsc-server-do`

### Step 3: Deploy Pages Project (GitHub Integration)

Since your Pages project is connected to GitHub, deployment is automatic:

```bash
git add .
git commit -m "Add Durable Objects integration"
git push origin main
```

Cloudflare Pages will:
1. Detect the push to GitHub
2. Run the build command: `cd rsc-server && npm install && npm run build-browser && cp dist/browser.bundle.min.js ../public/server.bundle.min.js`
3. Deploy the `public/` directory
4. Make the `/api/server` endpoint available via the DO binding

> **Important:** Ensure the build command in Cloudflare Pages settings matches the one in `package.json`.

**Alternative: Manual Deploy**
If you need to deploy without pushing to GitHub:

```bash
npm run build
wrangler pages deploy public
```

### Step 4: Update Client Connection (Future Work)

The client currently connects to a Web Worker. It needs to be updated to connect to the WebSocket endpoint:

```javascript
// Current (Web Worker mode):
const worker = new Worker('/server.bundle.min.js');

// New (Durable Object mode):
const ws = new WebSocket('wss://your-pages-url.pages.dev/api/server');
// Or for local dev:
// const ws = new WebSocket('ws://localhost:8790/api/server');
```

---

## Local Development

To test locally with the Durable Object:

```bash
# Terminal 1: Build the DO Worker
cd durable-objects
npm run build

# Terminal 2: Run Pages dev server with DO binding
cd ..
wrangler pages dev public --port 8790 --kv KV --do RSC_SERVER=RSCServerDO@rsc-server-do --local
```

Note: Local DO development requires wrangler 3.x and may have limitations.

---

## Verification

After deployment, verify:

1. **Durable Object Deployed:**
   - Check Cloudflare Dashboard → Workers → Durable Objects
   - Should see `rsc-server-do` with `RSCServerDO` class

2. **Pages Function Works:**
   - Visit: `https://your-url.pages.dev/api/server`
   - Should return: "Expected WebSocket connection" (426 status)

3. **WebSocket Connection:**
   - Use a WebSocket client to connect to `/api/server`
   - Should successfully upgrade to WebSocket

4. **Multiplayer Test:**
   - Open two browser tabs
   - Both players should see each other in-game

---

## Troubleshooting

### "Module not found" errors
- Ensure all dependencies are bundled by esbuild
- Check `external: []` in build.js (don't externalize anything)

### "require is not defined"
- The bundler didn't convert all CommonJS
- Try updating esbuild or check for dynamic requires

### WebSocket upgrade fails
- Check that `/functions/api/server.js` is deployed
- Verify DO binding is active in Pages settings

### Players can't see each other
- Check that both connections go to the same DO instance
- Verify `idFromName('main-server')` is used consistently

---

## Architecture Diagram

```
Client Browser 1 ──┐
                   │
Client Browser 2 ──┼──> Pages Function (/api/server)
                   │           │
Client Browser 3 ──┘           │ WebSocket Upgrade
                             │
                               ▼
                    Durable Object: RSCServerDO
                    ┌────────────────────────┐
                    │  Shared RSC Server     │
                    │  - World State         │
                    │  - Connected Players   │
                    │  - Game Logic          │
                    └───────────┬────────────┘
                                │
                                ▼
                         KV Storage
                         (Player Data)
```

---

## Next Steps

1. **Add esbuild bundling** as described above
2. **Test local deployment** with bundled worker
3. **Deploy to Cloudflare** and verify DO is created
4. **Update client code** to connect via WebSocket
5. **Test multiplayer** functionality

---

## Alternative: Manual ES Module Conversion

If bundling doesn't work, the RSC Server codebase can be manually converted:

- Change all `module.exports` to `export`
- Change all `require()` to `import`
- Update file extensions to `.mjs` or add `"type": "module"` to package.json

This is more time-consuming but gives full control over the module system.
