/**
 * RSC Zero-Cost Router
 * 
 * Handles:
 * 1. Geo-routing to Durable Object Shards (Americas/Europe/Asia/Oceania)
 * 2. Asset serving with fallback (R2 -> KV)
 * 3. Feature Flag Enforcement
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // --- 1. HEALTH CHECKS & ADMIN ---
        if (url.pathname === '/health') {
            return new Response('RSC Zero-Cost Router Online', { status: 200 });
        }

        // --- 2. ASSET SERVING (R2 -> KV Fallback) ---
        if (url.pathname.startsWith('/asset/')) {
            return await handleAsset(request, env, url);
        }

        // --- 3. SOVEREIGN GAME SHARDING ---
        // Force all traffic to the single Sovereign Shard for total world consistency
        const doBinding = env.RSC_SERVER || env.GAME_WORLD;

        if (!doBinding) {
            return new Response("Configuration Error: RSC_SERVER binding not found", { status: 500 });
        }

        // Use a stable ID for the global world instance
        const id = doBinding.idFromName('sovereign-world-alpha');
        const stub = doBinding.get(id);

        // Forward connection to the Sovereign Shard
        return stub.fetch(request);
    }
};

/**
 * Handles asset serving with cost-saving fallback logic
 * Protocol: Check R2 (if enabled) -> Check KV -> 404
 */
async function handleAsset(request, env, url) {
    const path = url.pathname.slice(7); // remove "/asset/"

    // A. R2 Storage (Sponsor Tier > $5/mo)
    if (env.FEATURE_R2_ASSETS === 'true' && env.RSC_ASSETS) {
        try {
            const r2Object = await env.RSC_ASSETS.get(path);
            if (r2Object) {
                const headers = new Headers();
                r2Object.writeHttpMetadata(headers);
                headers.set('etag', r2Object.httpEtag);
                // Aggressive caching for assets (save bandwidth)
                headers.set('Cache-Control', 'public, max-age=31536000, immutable');

                return new Response(r2Object.body, { headers });
            }
        } catch (e) {
            console.error('R2 Error:', e);
        }
    }

    // B. KV Storage (Free Tier Fallback)
    // Assets stored as base64 or raw strings in KV
    // Key format: "asset:sprites/man.png"
    if (env.KV) {
        const kvAsset = await env.KV.get(`asset:${path}`, { type: 'stream' });
        if (kvAsset) {
            return new Response(kvAsset, {
                headers: {
                    'Content-Type': getContentType(path),
                    'Cache-Control': 'public, max-age=86400' // 1 day cache for KV
                }
            });
        }
    }

    return new Response('Asset Not Found', { status: 404 });
}

function getContentType(path) {
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.json')) return 'application/json';
    if (path.endsWith('.glb')) return 'model/gltf-binary';
    return 'application/octet-stream';
}
