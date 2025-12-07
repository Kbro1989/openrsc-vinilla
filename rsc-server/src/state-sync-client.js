/**
 * State Sync Client - Synchronizes player state from Fly.io to Cloudflare KV
 * 
 * This module runs on the Fly.io server and periodically saves player state
 * to Cloudflare KV storage for backup and failover purposes.
 */

const https = require('https');

class StateSyncClient {
    constructor(config) {
        this.accountId = config.cloudflareAccountId;
        this.namespaceId = config.cloudflareKvNamespaceId;
        this.apiToken = config.cloudflareApiToken;
        this.syncInterval = config.syncInterval || 30000; // Default 30 seconds

        this.syncTimer = null;
        this.pendingSaves = new Map();
        this.isRunning = false;

        console.log('[StateSync] Initialized with interval:', this.syncInterval + 'ms');
    }

    /**
     * Start the state sync loop
     */
    start(server) {
        if (this.isRunning) {
            console.warn('[StateSync] Already running');
            return;
        }

        this.server = server;
        this.isRunning = true;

        // Start periodic sync
        this.syncTimer = setInterval(() => {
            this.syncAllPlayers();
        }, this.syncInterval);

        console.log('[StateSync] Started - syncing every', this.syncInterval / 1000, 'seconds');
    }

    /**
     * Stop the state sync loop
     */
    stop() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        this.isRunning = false;
        console.log('[StateSync] Stopped');
    }

    /**
     * Sync all connected players
     */
    async syncAllPlayers() {
        if (!this.server || !this.server.world) {
            return;
        }

        const players = Array.from(this.server.world.players.getAll());

        if (players.length === 0) {
            return;
        }

        console.log(`[StateSync] Syncing ${players.length} player(s) to Cloudflare KV`);

        const savePromises = players.map(player =>
            this.savePlayerState(player).catch(err => {
                console.error(`[StateSync] Failed to save player ${player.username}:`, err.message);
            })
        );

        await Promise.allSettled(savePromises);
    }

    /**
     * Save a single player's state to Cloudflare KV
     */
    async savePlayerState(player) {
        const key = `player:${player.username.toLowerCase()}`;
        const state = this.serializePlayerState(player);

        return this.putKV(key, state);
    }

    /**
     * Serialize player state to JSON
     */
    serializePlayerState(player) {
        return {
            username: player.username,
            x: player.x,
            y: player.y,
            skills: player.skills,
            inventory: player.inventory.items,
            bank: player.bank ? player.bank.items : [],
            questStages: player.questStages || {},
            combatStyle: player.combatStyle || 0,
            friends: player.friendListHashes || [],
            ignores: player.ignoreList || [],
            loginDate: Date.now(),
            lastSynced: Date.now()
        };
    }

    /**
     * Put a key-value pair in Cloudflare KV
     */
    async putKV(key, value) {
        const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encodeURIComponent(key)}`;

        const data = JSON.stringify(value);

        return new Promise((resolve, reject) => {
            const options = {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = https.request(url, options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                    } else {
                        reject(new Error(`KV PUT failed: ${res.statusCode} ${responseData}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    /**
     * Immediately save a player (used on logout or important events)
     */
    async immediateSave(player) {
        console.log(`[StateSync] Immediate save for player: ${player.username}`);
        await this.savePlayerState(player);
    }
}

module.exports = StateSyncClient;
