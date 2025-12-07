# RSC Server Durable Object

This directory contains the Cloudflare Durable Object Worker that hosts the shared RSC server instance.

## Build and Deploy

### Prerequisites
- Node.js installed
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account configured (`wrangler login`)

### Build
```bash
npm install
npm run build
```

This will:
- Install esbuild
- Bundle the RSC server and Durable Object code
- Convert CommonJS to ES Modules
- Output to `dist/worker.js`

### Deploy
```bash
npm run deploy
```

Or manually:
```bash
wrangler deploy
```

### Local Development
```bash
npm run dev
```

## Architecture

The Durable Object Worker:
1. Accepts WebSocket connections from the Pages Function proxy
2. Hosts a single, shared RSC Server instance
3. Manages all connected player sessions
4. Provides direct KV access for player data persistence

## Files

- `RSCServerDO.js` - Main Durable Object class
- `index.js` - Worker entry point
- `build.js` - esbuild configuration
- `wrangler.toml` - Cloudflare Worker configuration
- `package.json` - Dependencies and scripts

## Notes

- The Durable Object MUST be deployed before the Pages project
- All players connect to the same DO instance named `'main-server'`
- The bundler converts the RSC Server's CommonJS code to ESM automatically
