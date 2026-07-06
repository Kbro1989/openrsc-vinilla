# Cloudflare Infra Comparison: RSC vs ollama-cloudflare-worker

## Purpose
This file documents how the existing RuneScape Classic Cloudflare offload is built today, what newer Cloudflare capabilities are available from `developers.cloudflare.com`, and how the Ollama Cloudflare Worker should evolve. It is a working comparison, not just a summary.

## Source Context
- RSC root: `/mnt/c/Users/krist/Desktop/rsmv/external/openrsc-vinilla`
- RSC durable objects root: `/mnt/c/Users/krist/Desktop/rsmv/external/openrsc-vinilla/durable-objects`
- Ollama worker root: `/mnt/c/Users/krist/ollama-cloudflare-worker`
- RSC worker code: `worker.js`, `entry-server.js`, `durable-objects/index.js`, `durable-objects/RSCServerDO.js`, `durable-objects/PlayerDO.js`, `durable-objects/build-do.bat`, `durable-objects/build.js`, `durable-objects/wrangler.toml`, `wrangler-do.toml`

## RSC CF Usage Today

### Current Architecture
- Primary pod: Cloudflare Pages app for static/dashboard serving (`wrangler pages dev public`, `wrangler pages deploy public`).
- Game infra pod: standalone Durable Object worker(s) with WebSocket handling.
- Data pods: KV for assets/state and optional D1 for event sourcing; configured across multiple wrangler tomls.
- Lifecycle conventions:
  - DO worker deployed/bundled separately.
  - Pages and DO bindings aligned by binding name and shard id.

### Key RSC Files and Their Roles

#### 1. `worker.js`
- Top-level fetch router with explicit routes:
  - `/health`
  - `/asset/*` with R2 -> KV fallback
  - Otherwise forward to DO via `env.RSC_SERVER` or `env.GAME_WORLD`
- Uses fixed DO id:
  - `idFromName('sovereign-world-alpha')`
  - Then `get(id)` and `stub.fetch(request)`
- Owns the external protocol and schema allowed from clients:
  - JSON routes
  - Asset routes
  - Health routes

#### 2. `entry-server.js`
- Re-exports `RSCServerDO` under the name `GameWorld` for wrangler-server.toml.
- Uses `idFromName('sovereign-world-alpha')` as the single-world key.

#### 3. `durable-objects/index.js`
- Import bundler entry.
- Uses fixed name `default-world`:
  - `idFromName('default-world')`
  - `get(id)` and `stub.fetch(request)`

#### 4. `durable-objects/RSCServerDO.js`
- Main game DO class.
- Uses `node:buffer` for binary websocket handling.
- Accepts websocket upgrades.
- On first connect, initializes server and maps client -> RSC server.
- Stores per-session state in Map() inside the DO instance.
- Uses KV for debug logging and optional durability.

#### 5. `durable-objects/PlayerDO.js`
- Combines shard session boundary, safety caps, and websocket lifecycle.
- Uses D1 for event logs when available.
- Safety pattern:
  - Daily request cap check before serving traffic
  - `free tier` discipline with explicit 429 response

#### 6. `durable-objects/build-do.bat` and `durable-objects/build.js`
- CJS-first DO project bundled with esbuild.
- Uses `platform: 'neutral'` for Workers runtime.
- Externalizes Node built-ins it knows will break Workers.
- Loads custom binary asset loaders `.jag` and `.mem`.

#### 7. `wrangler-do.toml` and `wrangler-server.toml`
- Wrangler legacy DO config style with:
  - `[durable_objects]` binding block
  - `[kv_namespaces]`
  - `[[migrations]]`
- Uses `new_sqlite_classes = [...]` and class_name bounds.

### RSC Patterns To Preserve For Ollama

1. **Boundary Isolation**
   - RSC keeps asset serving, websocket entry, and DO logic in separate files/workers.
   - Ollama should keep routing, proxy, caching, and sandbox policy separated.

2. **Stable Shard Identity**
   - RSC uses a fixed DO name/key via `idFromName(...)`.
   - Ollama should do the same for its local Ollama bridge DO.

3. **Safety / Cap Counter Pattern**
   - RSC introduced an explicit daily request cap with `429`.
   - Ollama can mirror that around proxy traffic, especially for large responses or model operations.

4. **Dual-Entry Build Layout**
   - RSC has `rsc-server-do-worker.js` for bundle-only format and `entry-server.js` for the legacy toml entry.
   - Ollama now has a single `src/index.ts` and doc configs; preserving this layout is fine because projects diverge.

5. **KV and optional D1**
   - RSC uses KV for lightweight state and fallback data.
   - RSC also reserves D1 for richer logs.
   - Ollama currently uses KV for cache and is not yet using D1 for logs or request tracing.
   - Newer Cloudflare model suggests adding structured “proxy request log” to KV or D1 can help debugging without blocking the hot path.

## Newer Cloudflare Capabilities To Adopt

Based on current `developers.cloudflare.com` APIs and platform docs, these are now natively supported and worth applying directly to the Ollama worker so manual workarounds go away:

### 1. Durable Objects SQLite Storage
- Old assumption: DO state or cache is KV-only.
- Current doc: `developers.cloudflare.com/durable-objects/api/` and Getting Started now emphasize SQLite-backed DO storage.
- Impact for Ollama:
  - Move the request/response/meta logs and model cache state into `state.storage` SQL APIs instead of KV for integrity and atomicity.
  - Fixes the loose “cache-as-we-go” semantics currently scattered across `ollama-do.ts`.

### 2. Modern Wrangler Config Shapes
- Current docs show newer config blocks like:
  - `[durable_objects]` and `[[durable_objects.bindings]]`
  - `[[migrations]]` with `new_sqlite_classes`
  - `nodejs_compat` compatibility_flag in many examples
- RSC kept an older style in some docs.
- Impact for Ollama:
  - Update `wrangler.toml` for clearer binding table style and migrations tags.
  - This reduces surprises when deploying or changing migrations.

### 3. Streaming-friendly Response Patterns
- Cloudflare now documents streaming upgrade paths and binary websocket semantics.
- Old RSC approach: custom websocket bridged though DO manually.
- Impact for Ollama:
  - For streaming inference endpoints, preserve binary/json streaming without forcing manual acceptor writes.
  - This likely replaces the simple JSON cache with stream-aware code paths.

### 4. State Isolation
- Newer docs stress DO instances as the **single authoritative copy** for connection state.
- RSC already does this with one stable instance for `default-world`.
- Impact for Ollama:
  - Ensure `idFromName('ollama-instance')` stays constant, but consider a sharded instance design if you later want load-based partitioning.

### 5. Limits and Retry Budgets
- Modern Docs cover request limits, duration, and memory limits for Workers and DOs.
- Impact for Ollama:
  - Add explicit limits:
    - Max request size
    - Max response body size during cache write
    - Max duration for subrequests to local Ollama
  - These should be enforced in `ollama-do.ts` so the worker never surprises the local host info unintentionally.

## Direct Ollama Roadmap vs RSC

| Dimension | RSC Today | Ollama Today | Ollama Next |
|---|---|---|---|
| Primary pod | Pages + standalone DO worker | One Worker + 1 DO | Single Worker + optional sharded DOs |
| Client protocol | WebSocket binary | HTTP REST | HTTP/JSON now; streaming later |
| State | Map() + KV + D1 logs | KV cache + inline Map cache | SQLite-backed storage in DO |
| Response policy | Fixed fixed id | Fixed id already | Stable id + shard tags + cap counter |
| Deployment | Bundle DO then Pages | Local dev + deploy same worker | Separate DO worker worker + Pages/Worker front |
| Warmup | None explicit | None explicit | Alarm to preload model list / tag checks |
| Proxy policy | Strict websocket upgrade sandbox | Partial header stripping | Full header/cap/contract sandbox layer |
| Limits | RSC adds 429/safety CLI | No limits implemented | Use modern limits doc guidance |

## Recommended Next Steps

1. **Write modern config docs**
   - Update `wrangler.toml` to the latest supported binding shape and compatibility flags.
   - Keep the legacy local compatibility lines only where wrangler version requires.

2. **Move sensitive state into SQLite-backed DO storage**
   - Replace ad hoc KV cache writes with SQLite-backed data where atomicity matters.
   - Keep KV for ephemeral request deduplication only.

3. **Add request cap / safety filter**
   - Borrow the RSCDaily cap idiom.
   - Enforce on every proxy call, with explicit `429` JSON error.

4. **Formalize the sandbox layer**
   - Expand `sandboxHeaders` / `sandboxResponseHeaders` into a dedicated `src/sandbox.ts`.
   - Add size/contract checks before forwarding to local Ollama.

5. **Scrape and bookmark docs**
   - Keep `developers.cloudflare.com` pages for DO API, websockets, limits, and Wrangler as reference states.
   - Use these as source of truth every time CF changes runtime limits or APIs.

## Files To Update
- `/mnt/c/Users/krist/ollama-cloudflare-worker/wrangler.toml`
- `/mnt/c/Users/krist/ollama-cloudflare-worker/src/ollama-do.ts`
- `/mnt/c/Users/krist/ollama-cloudflare-worker/src/index.ts`
- `/mnt/c/Users/krist/ollama-cloudflare-worker/tsconfig.json`
- This note file: `/mnt/c/Users/krist/Desktop/rsmv/external/openrsc-vinilla/CF_INFRA_COMPARISON.md`
