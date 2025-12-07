# Build Test Results & Findings

## Issue Discovered

The RSC Server codebase has **fundamental incompatibilities** with Cloudflare Workers runtime that cannot be solved through simple bundling:

### Node.js Dependencies
The server deeply relies on Node.js built-in modules that don't exist in Workers:
- `fs` - File system operations (landscape loading, cache files)
- `net` - TCP sockets (for native TCP client support)
- `path` - Path manipulation
- `events` - EventEmitter (used throughout)
- `crypto` - Cryptographic operations
- `stream` - Stream operations

### Why Bundling Won't Work
- **Externalizing** these modules means they won't be bundled, but they also won't exist at runtime in Workers
- **Polyfilling** all these Node.js APIs for Workers is extremely complex and may not be possible for networking modules
- The landscape loading system (`@2003scape/rsc-landscape`) reads `.jag` files from disk using `fs.readFileSync`

## Alternative Solutions

### Option 1: Hybrid Architecture  ⭐ RECOMMENDED
Keep the current Web Worker approach for now, but use Durable Objects for **player synchronization** only:

```
Client 1 ──┐
           ├──> Web Worker (Local RSC Server)
Client 2 ──┤           │
           └───────────┴──> Durable Object (Player Sync)
                                     │
                                     ▼
                              KV Storage (Player Data)
```

**Benefits:**
- Minimal code changes required
- Keeps existing server logic intact
- DO only handles player position/action broadcasting
- Much simpler to implement

### Option 2: Port Server to Workers-Compatible Code
Rewrite core server components to work in Workers runtime:
- Replace `fs` operations with fetching from R2/KV
- Remove TCP socket support (WebSocket only)
- Replace Node.js EventEmitter with custom implementation
- Pre-bundle landscape data into the Worker

**Effort:** Several weeks of development
**Risk:** High - major refactoring required

### Option 3: Use Cloudflare Workers + External Server
- Deploy RSC Server to a traditional Node.js host (Fly.io, Railway, etc.)
- Use Cloudflare Workers as a proxy/load balancer
- Still get global edge distribution benefits

## Recommended Next Steps

1. **Implement Option 1** - Player sync via Durable Objects
   - Create a lightweight DO that only handles player state broadcasting
   - Keep Web Worker for game logic
   - Much faster to implement and test

2. **Future Migration Path**
   - Gradually port components to be Workers-compatible
   - Start with smaller, isolated systems
   - Eventually reach full DO deployment

## What We Learned

✅ Durable Objects are perfect for stateful, multiplayer coordination  
✅ The architecture and proxy pattern we designed is sound  
❌ Direct "lift and shift" of Node.js server to Workers isn't feasible  
❌ RSC Server needs significant adaptation for Workers runtime  

The infrastructure we built (DO class, proxy function, configurations) is still valuable and can be adapted for the hybrid approach.
