/**
 * Pages Function — Sovereign Router
 * 
 * Catch-all function that proxies WebSocket connections to the
 * RSC Server Durable Object while letting static assets pass through.
 */

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
        return new Response('RSC Zero-Cost Router Online', { status: 200 });
    }

    // Favicon — suppress 426 noise
    if (url.pathname === '/favicon.ico') {
        return new Response(null, { status: 204 });
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
