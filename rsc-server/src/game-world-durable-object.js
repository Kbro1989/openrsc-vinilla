/**
 * GameWorld Durable Object - MMO Server with Cloudflare Infrastructure
 * Uses authentic RSC Server with binary packet protocol
 */

const Server = require('./server');

export class GameWorld {
    constructor(state, env) {
        this.state = state;
        this.env = env;

        // WebSocket connections (raw, before RSCSocket wrapping)
        this.connections = new Map(); // WebSocket -> RSCSocket wrapper

        // Initialize authentic RSC server
        this.server = null;
        this.initializeServer();
    }

    async initializeServer() {
        // Create authentic RSC server with Cloudflare KV
        this.server = new Server({
            worldID: 1,
            members: this.env.MEMBERS === 'true',
            tcpPort: null, // No TCP in Workers
            websocketPort: null, // WebSocket handled by DO
            skipDataServer: true // Use KV directly, not DataClient
        }, this.env);

        // Initialize server (loads world data, plugins, etc.)
        await this.server.init();

        console.log('RSC Server initialized in Durable Object');
        console.log(`Members=${this.env.MEMBERS}, World=1`);
    }

    async fetch(request) {
        const url = new URL(request.url);

        // WebSocket upgrade for game connections
        if (request.headers.get('Upgrade') === 'websocket') {
            return this.handleWebSocketUpgrade(request);
        }

        // HTTP endpoints
        if (url.pathname === '/status') {
            return new Response(JSON.stringify({
                players: this.server.world.players.getAll().length,
                npcs: this.server.world.npcs.getAll().length,
                ticks: this.server.world.ticks
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response('RSC Game World - Use WebSocket for game connection', { status: 200 });
    }

    async handleWebSocketUpgrade(request) {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        // Accept WebSocket in Durable Object
        this.state.acceptWebSocket(server);

        // Store raw WebSocket
        this.connections.set(server, null); // Will be set to RSCSocket wrapper

        // Wire to RSC Server's handleConnection (wraps in RSCSocket)
        this.server.handleConnection(new DurableObjectWebSocketAdapter(server, this));

        return new Response(null, {
            status: 101,
            webSocket: client
        });
    }

    async webSocketMessage(ws, message) {
        // Binary message from client (RSC packet)
        // RSCSocket wrapper handles this automatically
        const adapter = this.connections.get(ws);
        if (adapter) {
            adapter.emit('data', message);
        }
    }

    async webSocketClose(ws, code, reason) {
        const adapter = this.connections.get(ws);
        if (adapter) {
            adapter.emit('close', false);
            this.connections.delete(ws);
        }
    }

    async webSocketError(ws, error) {
        console.error('WebSocket error:', error);
        await this.webSocketClose(ws, 1006, 'Error');
    }

    // Tick loop using Durable Object alarms
    async alarm() {
        // Run game tick (authentic RSC logic)
        this.server.readMessages();
        this.server.sendMessages();

        // Schedule next tick (640ms = authentic RSC tick rate)
        await this.state.storage.setAlarm(Date.now() + 640);
    }
}

/**
 * WebSocket Adapter - Makes Durable Object WebSocket look like Node net.Socket
 * This allows RSCSocket to work with Cloudflare WebSockets
 */
class DurableObjectWebSocketAdapter {
    constructor(ws, durableObject) {
        this.ws = ws;
        this.durableObject = durableObject;
        this.listeners = {};

        // Store in connections map
        durableObject.connections.set(ws, this);
    }

    // EventEmitter-like interface
    on(event, handler) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }

    emit(event, ...args) {
        if (this.listeners[event]) {
            for (const handler of this.listeners[event]) {
                handler(...args);
            }
        }
    }

    removeAllListeners() {
        this.listeners = {};
    }

    // Socket-like interface for RSCSocket
    write(data) {
        if (this.ws.readyState === 1) { // WebSocket.OPEN
            this.ws.send(data);
        }
    }

    close() {
        this.ws.close();
    }

    setTimeout() {
        // No-op in Workers (no socket timeouts)
    }

    toString() {
        return `[DurableObjectWebSocket]`;
    }
}

module.exports = { GameWorld };
