/**
 * PlayerDO - The Zero-Cost Game Engine Core
 * 
 * Architecture:
 * - 1 Durable Object per Region (Shard)
 * - 640ms Authentic Tick Loop
 * - D1 Event Sourcing (Free Tier: 100k writes/day)
 * - Hard Safety Caps (Protects from billing)
 */

// NOTE: Real GameWorld has fs/canvas dependencies not yet ported to Cloudflare.
// Using MockGameWorld to deploy infrastructure first.
// import { GameWorld } from '../rsc-server/src/game-world-durable-object.js';
class GameWorld {
    constructor(state, env) { console.log('Mock GameWorld Initialized'); }
    async webSocketMessage(ws, msg) { console.log('Mock Msg:', msg); }
    async webSocketClose(ws) { console.log('Mock Close'); }
    async alarm() { console.log('Mock Tick'); }
}

const TICK_RATE = 640;
const SAFETY_DAILY_CAP = 90000; // Hard stop before 100k limit

export class PlayerDO {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.players = new Map();

        // Safety Counters (Reset daily via alarm check or crude timestamp diff)
        this.requestCount = 0;
        this.lastReset = Date.now();

        // Initialize Game World
        // Note: In a real deployment, we'd bundle the GameWorld logic
        this.game = new GameWorld(state, env);

        // Start the engine
        this.state.blockConcurrencyWhile(async () => {
            await this.loadState();
        });
    }

    async fetch(request) {
        // 1. SAFETY GATE: Check Free Tier Limits
        if (this.checkSafetyCap()) {
            return new Response("Free Tier Limit Reached - Come back tomorrow!", { status: 429 });
        }

        // 2. Handle WebSocket Upgrades
        if (request.headers.get('Upgrade') === 'websocket') {
            return this.handleWebSocket(request);
        }

        // 3. Admin/Debug Routes
        const url = new URL(request.url);
        if (url.pathname === '/health') {
            return Response.json({ status: 'ok', players: this.players.size, reqs: this.requestCount });
        }

        return new Response('RSC Zero-Cost Shard Active', { status: 200 });
    }

    checkSafetyCap() {
        // Reset counter if it's a new day (UTC)
        const now = new Date();
        const last = new Date(this.lastReset);
        if (now.getUTCDate() !== last.getUTCDate()) {
            this.requestCount = 0;
            this.lastReset = Date.now();
        }

        this.requestCount++;

        // Hard Stop if we exceed defined safety cap
        const cap = parseInt(this.env.SAFETY_REQ_CAP || SAFETY_DAILY_CAP);
        if (this.requestCount > cap) {
            console.warn(`SAFETY: Limit hit (${this.requestCount}/${cap}). Rejecting requests.`);
            return true;
        }
        return false;
    }

    async handleWebSocket(request) {
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);

        this.state.acceptWebSocket(server);
        return new Response(null, { status: 101, webSocket: client });
    }

    async webSocketMessage(ws, msg) {
        const data = JSON.parse(msg);

        // Track player socket
        if (!this.players.has(ws) && data.type === 'login') {
            await this.handleLogin(ws, data);
        }

        // Pass to Game Logic
        // In full implementation, we'd write to D1 here for event sourcing
        // await this.logEvent(data);

        await this.game.webSocketMessage(ws, msg);
    }

    async handleLogin(ws, data) {
        this.players.set(ws, { username: data.username, joined: Date.now() });

        // D1 Event Sourcing: Log Login
        if (this.env.DB) {
            try {
                await this.env.DB.prepare(
                    `INSERT INTO game_stats(event_type, data, timestamp) VALUES (?, ?, ?)`
                ).bind('login', JSON.stringify({ user: data.username }), Date.now()).run();
            } catch (e) {
                console.error("D1 Log Error:", e); // Non-blocking
            }
        }
    }

    async webSocketClose(ws) {
        const p = this.players.get(ws);
        this.players.delete(ws);
        await this.game.webSocketClose(ws);

        if (p && this.env.DB) {
            try {
                await this.env.DB.prepare(
                    `INSERT INTO game_stats(event_type, data, timestamp) VALUES (?, ?, ?)`
                ).bind('logout', JSON.stringify({ user: p.username }), Date.now()).run();
            } catch (e) { console.error("D1 Log Error:", e); }
        }
    }

    // 640ms Authentic Tick Loop
    // Triggered by the GameWorld class, but we could enforce it here too
    async alarm() {
        await this.game.alarm();
    }

    async loadState() {
        // Load persistent state if needed
        // this.state.storage.get(...)
    }
}
