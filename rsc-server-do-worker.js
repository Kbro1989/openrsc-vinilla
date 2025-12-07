/**
 * RSC Game Server - PartyServer Implementation
 * Using Cloudflare's official multiplayer library
 */

import { routePartykitRequest, Server } from "partyserver";

// Connection state - track each player
export class GameWorld extends Server {
    async onConnect(conn, ctx) {
        console.log(`Player connected: ${conn.id}`);

        // Send welcome message
        conn.send(JSON.stringify({
            type: 'welcome',
            connectionId: conn.id,
            message: 'Connected to RSC Game Server'
        }));
    }

    async onMessage(conn, message) {
        try {
            // Handle binary RSC packets OR JSON
            if (typeof message === 'string') {
                const data = JSON.parse(message);
                console.log('Received JSON:', data.type);

                // Handle different message types
                switch (data.type) {
                    case 'login':
                        await this.handleLogin(conn, data);
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            } else {
                // Binary RSC packet
                console.log('Received binary packet:', message.byteLength, 'bytes');
                // Echo back for now
                conn.send(message);
            }
        } catch (err) {
            console.error('Message handling error:', err);
        }
    }

    async handleLogin(conn, data) {
        const { username } = data;
        console.log(`Login attempt: ${username}`);

        // Notify all other players
        this.broadcast(JSON.stringify({
            type: 'player_joined',
            username,
            connectionId: conn.id
        }), [conn.id]);

        // Send login success
        conn.send(JSON.stringify({
            type: 'login_success',
            username
        }));
    }

    async onClose(conn) {
        console.log(`Player disconnected: ${conn.id}`);
    }

    async onError(conn, error) {
        console.error('Connection error:', error);
    }
}

// Main Worker export
export default {
    async fetch(request, env) {
        // Route all requests through PartyServer
        return (
            await routePartykitRequest(request, { ...env }) ||
            new Response('RSC Game Server - Use WebSocket', { status: 404 })
        );
    }
};
