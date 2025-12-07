/**
 * Cloudflare Pages Function: WebSocket Proxy to Durable Object
 * 
 * This function proxies WebSocket connections from clients to the
 * RSCServerDO Durable Object, ensuring all players connect to the
 * same server instance.
 * 
 * Endpoint: /api/server
 */

export async function onRequest(context) {
    const { request, env } = context;

    // Verify WebSocket upgrade request
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket connection', {
            status: 426,
            headers: {
                'Upgrade': 'websocket',
                'Content-Type': 'text/plain'
            }
        });
    }

    try {
        // Get the Durable Object stub using a fixed name
        // This ensures all connections go to the same instance
        const durableObjectId = env.RSC_SERVER.idFromName('main-server');
        const durableObjectStub = env.RSC_SERVER.get(durableObjectId);

        // Forward the WebSocket upgrade request to the Durable Object
        const response = await durableObjectStub.fetch(request);

        return response;
    } catch (error) {
        console.error('[Proxy] Error connecting to Durable Object:', error);

        return new Response(`Failed to connect to game server: ${error.message}`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
