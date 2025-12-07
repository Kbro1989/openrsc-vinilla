/**
 * Pages Functions WebSocket Handler
 * This enables game server WebSocket connections directly in Pages
 */

export async function onRequest(context) {
    const { request, env } = context;

    const upgradeHeader = request.headers.get('Upgrade');

    // Handle WebSocket upgrade for game connections
    if (upgradeHeader === 'websocket') {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        // Accept the WebSocket
        server.accept();

        console.log('WebSocket connection accepted in Pages Functions');

        // Handle messages
        server.addEventListener('message', (event) => {
            console.log('Client sent:', event.data.byteLength, 'bytes');
            // Echo back for now
            server.send(event.data);
        });

        server.addEventListener('close', () => {
            console.log('WebSocket closed');
        });

        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }

    // Regular HTTP request -  serve static files
    return context.next();
}
