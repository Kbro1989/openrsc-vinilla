/**
 * Pages Function — Sovereign Router
 * 
 * Catch-all function that proxies WebSocket connections to the
 * RSC Server Durable Object and serves player API for browser solo mode.
 */

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
        return new Response('RSC Zero-Cost Router Online', { status: 200 });
    }

    // Favicon
    if (url.pathname === '/favicon.ico') {
        return new Response(null, { status: 204 });
    }

    // --- Player API (bridges browser solo mode to KV) ---

    if (url.pathname === '/api/player/load' && env.KV) {
        const username = url.searchParams.get('username')?.toLowerCase();
        if (!username) return new Response('Missing username', { status: 400 });

        const data = await env.KV.get(`player:${username}`);
        if (!data) return new Response('Not found', { status: 404 });

        return new Response(data, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (url.pathname === '/api/player/save' && request.method === 'POST' && env.KV) {
        try {
            const player = await request.json();
            const username = player.username?.toLowerCase();
            if (!username) return new Response('Missing username', { status: 400 });

            // Merge with existing to preserve password
            const existing = await env.KV.get(`player:${username}`);
            const merged = existing ? { ...JSON.parse(existing), ...player } : player;

            await env.KV.put(`player:${username}`, JSON.stringify(merged));
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
    }

    // Status endpoint
    if (url.pathname === '/status') {
        const doBinding = env.RSC_SERVER || env.GAME_WORLD;
        if (!doBinding) {
            return new Response(JSON.stringify({ error: 'No DO binding' }), { status: 500 });
        }
        const id = doBinding.idFromName('sovereign-world-alpha');
        const stub = doBinding.get(id);
        return stub.fetch(request);
    }

    // WebSocket upgrade — proxy to Sovereign Shard
    if (request.headers.get('Upgrade') === 'websocket') {
        const doBinding = env.RSC_SERVER || env.GAME_WORLD;
        if (!doBinding) {
            return new Response('Configuration Error: RSC_SERVER binding not found', { status: 500 });
        }
        const id = doBinding.idFromName('sovereign-world-alpha');
        const stub = doBinding.get(id);
        return stub.fetch(request);
    }

    // Everything else — let Pages serve static assets from public/
    return context.next();
}
