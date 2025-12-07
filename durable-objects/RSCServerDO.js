/**
 * RSCServerDO - Durable Object for RuneScape Classic Server
 * 
 * This Durable Object hosts a single, shared RSC server instance that all
 * players connect to via WebSocket. It maintains the game world state in
 * memory and persists player data to KV storage.
 */

import { Buffer } from 'node:buffer';
import Server from '../rsc-server/src/server.js';
import land63 from '../rsc-server/node_modules/@2003scape/rsc-data/landscape/land63.jag';
import maps63 from '../rsc-server/node_modules/@2003scape/rsc-data/landscape/maps63.jag';
import landmem63 from '../rsc-server/node_modules/@2003scape/rsc-data/landscape/land63.mem';
import mapsmem63 from '../rsc-server/node_modules/@2003scape/rsc-data/landscape/maps63.mem';

export class RSCServerDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;

        // Track WebSocket sessions
        this.sessions = new Map();

        // Shared RSC Server instance (initialized on first connection)
        this.server = null;

        // Session counter for unique IDs
        this.sessionCounter = 0;

        console.log('RSCServerDO initialized');
    }

    /**
     * Handle incoming fetch requests (WebSocket upgrades)
     */
    async fetch(request) {
        try {
            const upgradeHeader = request.headers.get('Upgrade');

            if (upgradeHeader !== 'websocket') {
                return new Response('Expected WebSocket connection', {
                    status: 426,
                    headers: { 'Upgrade': 'websocket' }
                });
            }

            // Create WebSocket pair
            const [client, server] = Object.values(new WebSocketPair());

            // Handle the session
            await this.handleSession(server);

            // Check for subprotocol request (client sends 'binary')
            const requestedProtocol = request.headers.get('Sec-WebSocket-Protocol');

            // Return the client WebSocket to the caller with subprotocol if requested
            const responseHeaders = {};
            if (requestedProtocol) {
                // Echo back the first requested protocol (client expects 'binary')
                responseHeaders['Sec-WebSocket-Protocol'] = requestedProtocol.split(',')[0].trim();
            }

            return new Response(null, {
                status: 101,
                webSocket: client,
                headers: responseHeaders
            });
        } catch (err) {
            return new Response(`Durable Object Error: ${err.message}\n${err.stack}`, { status: 500 });
        }
    }

    /**
     * Handle a new WebSocket session
     */
    async handleSession(webSocket) {
        // Initialize server on first connection
        if (!this.server) {
            await this.initializeServer();
        }

        // Accept the WebSocket
        webSocket.accept();

        // Generate unique session ID
        const sessionId = `session-${++this.sessionCounter}-${Date.now()}`;

        try {
            // Store session
            this.sessions.set(sessionId, {
                socket: webSocket,
                id: sessionId,
                connected: true
            });

            console.log(`[DO] New session connected: ${sessionId} (Total: ${this.sessions.size})`);

            // Create a socket wrapper that bridges WebSocket to RSC Server
            const socketBridge = this.createSocketBridge(sessionId, webSocket);

            // Connect to the RSC server
            try {
                this.server.handleConnection(socketBridge);
                console.log(`[DO] handleConnection success for ${sessionId}`);
            } catch (connErr) {
                const msg = `CONN_ERROR: ${connErr.message}\n${connErr.stack}`;
                console.error(msg);
                await this.env.KV.put('debug_error_conn', msg);
                throw connErr; // Re-throw to be caught by outer block
            }

            // Handle WebSocket messages
            webSocket.addEventListener('message', async (event) => {
                try {
                    const data = event.data;

                    // Convert WebSocket message to Buffer-like format
                    let buffer;
                    if (typeof data === 'string') {
                        buffer = Buffer.from(data, 'utf8');
                    } else if (data instanceof ArrayBuffer) {
                        buffer = Buffer.from(data);
                    } else {
                        buffer = Buffer.from(data);
                    }

                    // Emit as 'data' event to the socket bridge
                    socketBridge.emit('data', buffer);
                } catch (error) {
                    const msg = `MSG_ERROR: ${error.message}\n${error.stack}`;
                    console.error('[DO] Error processing message:', msg);
                    // Fire and forget KV logging (async)
                    this.env.KV.put('debug_error_msg_' + Date.now(), msg).catch(() => { });
                }
            });

            // Handle WebSocket close
            webSocket.addEventListener('close', () => {
                console.log(`[DO] Session closed: ${sessionId}`);
                this.sessions.delete(sessionId);
                socketBridge.emit('close', false);
            });

            // Handle WebSocket errors
            webSocket.addEventListener('error', (error) => {
                console.error('[DO] WebSocket error:', error);
                this.sessions.delete(sessionId);
                socketBridge.emit('error', error);
            });

        } catch (err) {
            // Critical Runtime Error AFTER accept
            const msg = `CRITICAL_ERROR: ${err.message}\n${err.stack}`;
            console.error(msg);
            try {
                await this.env.KV.put('debug_error_session', msg);
                webSocket.send(msg);
                webSocket.close(1011, "Internal Error");
            } catch (e) { /* ignore */ }
        }
    }

    /**
     * Initialize the RSC Server instance
     */
    async initializeServer() {
        console.log('[DO] Initializing RSC Server...');

        // Server configuration
        const config = {
            worldID: 1,
            version: 204,  // Must match client version
            members: true,
            experienceRate: 4,  // Authentic RSC: server stores 4x, client displays 1x
            tcpPort: null, // Not used in DO mode
            websocketPort: null, // Not used in DO mode
            landscapeData: {
                landMsg: Buffer.from(land63),
                mapsJag: Buffer.from(maps63),
                landMem: Buffer.from(landmem63),
                mapsMem: Buffer.from(mapsmem63)
            }
        };

        try {
            // Create server instance with env for KV access
            this.server = new Server(config, this.env);

            // Initialize server
            await this.server.init();

            console.log('[DO] RSC Server initialized successfully');
        } catch (err) {
            const msg = `INIT_ERROR: ${err.message}\n${err.stack}`;
            await this.env.KV.put('debug_error_init', msg);
            throw err;
        }
    }

    /**
     * Create a socket bridge that connects WebSocket to RSC Server
     * This mimics the Node.js socket interface expected by RSC Server
     */
    createSocketBridge(sessionId, webSocket) {
        const EventEmitter = require('events');

        class DurableObjectWebSocket extends EventEmitter {
            constructor(id, ws) {
                super();
                this.id = id;
                this.ws = ws;
                this.remoteAddress = '0.0.0.0'; // Cloudflare doesn't expose real IP
                this.destroyed = false;

                // RSCSocket accesses _socket.remoteAddress, _socket.setTimeout, and _socket.on('timeout')
                // _socket needs to be an EventEmitter for timeout binding
                const socketSelf = this;
                this._socket = new EventEmitter();
                this._socket.remoteAddress = '0.0.0.0';
                this._socket.setTimeout = () => { }; // No-op for DO
            }

            // RSCSocket.send() calls socket.send() for WebSocket mode
            send(data) {
                if (this.destroyed || this.ws.readyState !== 1) {
                    return;
                }

                try {
                    // Convert Buffer to ArrayBuffer for WebSocket
                    if (Buffer.isBuffer(data)) {
                        this.ws.send(data.buffer.slice(
                            data.byteOffset,
                            data.byteOffset + data.byteLength
                        ));
                    } else {
                        this.ws.send(data);
                    }
                } catch (error) {
                    console.error('[DO] Error sending to WebSocket:', error);
                }
            }

            // Keep write() for backwards compatibility
            write(data) {
                this.send(data);
            }

            connect() {
                // No-op, already connected
            }

            // RSCSocket.close() calls socket.terminate() for WebSocket mode
            terminate() {
                this.destroyed = true;
                try {
                    this.ws.close();
                } catch (e) {
                    // Ignore close errors
                }
            }

            destroy() {
                this.terminate();
            }

            end() {
                this.terminate();
            }

            setKeepAlive() {
                // WebSocket handles this automatically
            }

            setTimeout(timeout) {
                // Store timeout for potential use
                this._timeout = timeout;
            }

            toString() {
                return `[DurableObjectWebSocket ${this.id}]`;
            }
        }

        return new DurableObjectWebSocket(sessionId, webSocket);
    }

    /**
     * Alarm handler for periodic tasks (optional)
     */
    async alarm() {
        // Could be used for periodic world saves or cleanup
        console.log('[DO] Alarm triggered');
    }
}
