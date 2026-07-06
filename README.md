# openrsc-vinilla — OpenRSC Cloudflare Adapter

> JavaScript · TypeScript · Cloudflare Durable Objects · WebSocket

OpenRSC vanilla server running on Cloudflare via a **Durable Object WebSocket Adapter**.
Preserves the authentic **640ms metabolic tick** from classic RuneScape.

## What It Does

- Cloudflare DO WebSocket adapter for the OpenRSC game server
- 640ms tick loop — identical rhythm to RSC 2004 era
- KV-backed player state persistence
- WebSocket session management via Durable Objects

## Architecture

```
src/              # Worker + DO adapter source
wrangler.toml     # Cloudflare deployment config
package.json      # Dependencies
```
