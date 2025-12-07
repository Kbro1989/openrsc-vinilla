/**
 * FlyDataClient - Data client for Fly.io that uses Cloudflare KV REST API
 * Similar to BrowserDataClient but uses the Cloudflare API instead of browser fetch
 */

const https = require('https');
const log = require('bole')('fly-data-client');

const DEFAULT_PLAYER = {
    username: '',
    password: '',
    group: 0,
    x: 213,
    y: 436,
    fatigue: 0,
    combatStyle: 0,
    blockChat: 0,
    blockPrivateChat: 0,
    blockTrade: 0,
    blockDuel: 0,
    cameraAuto: 0,
    oneMouseButton: 0,
    soundOn: 1,
    hairColour: 2,
    topColour: 8,
    trouserColour: 14,
    skinColour: 0,
    headSprite: 1,
    bodySprite: 2,
    skulled: 0,
    friends: [],
    ignores: [],
    inventory: [],
    bank: [],
    questPoints: 0,
    questStages: {},
    skills: {
        attack: { current: 1, experience: 0 },
        defense: { current: 1, experience: 0 },
        strength: { current: 1, experience: 0 },
        hits: { current: 9, experience: 2304 },
        ranged: { current: 1, experience: 0 },
        prayer: { current: 1, experience: 0 },
        magic: { current: 1, experience: 0 },
        cooking: { current: 1, experience: 0 },
        woodcutting: { current: 1, experience: 0 },
        fletching: { current: 1, experience: 0 },
        fishing: { current: 1, experience: 0 },
        firemaking: { current: 1, experience: 0 },
        crafting: { current: 1, experience: 0 },
        smithing: { current: 1, experience: 0 },
        mining: { current: 1, experience: 0 },
        herblaw: { current: 1, experience: 0 },
        agility: { current: 1, experience: 0 },
        thieving: { current: 1, experience: 0 }
    },
    cache: {},
    loginIP: null,
    world: 0
};

class FlyDataClient {
    constructor(server, config) {
        this.server = server;
        this.world = this.server.world;
        this.connected = true; // Always connected for standalone mode

        this.accountId = config.cloudflareAccountId;
        this.namespaceId = config.cloudflareKvNamespaceId;
        this.apiToken = config.cloudflareApiToken;

        // Player cache
        this.players = new Map();
        this.playerUsernames = new Map();

        log.info('FlyDataClient initialized');
        console.log('FlyDataClient: Cloudflare KV mode', {
            accountId: this.accountId,
            namespaceId: this.namespaceId,
            hasToken: !!this.apiToken
        });
    }

    async init() {
        log.info('FlyDataClient ready (Cloudflare KV REST API mode)');
        console.log('%c FLY.IO CLOUDFLARE KV MODE ', 'background: #ff6600; color: white; font-size: 20px');
    }

    // Cloudflare KV REST API methods
    async kvGet(key) {
        console.log(`[KV GET] Fetching key: ${key}`);

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.cloudflare.com',
                port: 443,
                path: `/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encodeURIComponent(key)}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`[KV GET] Status: ${res.statusCode} for key: ${key}`);

                    if (res.statusCode === 200) {
                        console.log(`[KV GET] Data found (len=${data.length})`);
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            resolve(data);
                        }
                    } else if (res.statusCode === 404) {
                        console.log(`[KV GET] Key not found (404)`);
                        resolve(null);
                    } else {
                        console.error(`[KV GET] Error: ${res.statusCode} ${data}`);
                        reject(new Error(`KV GET failed: ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (err) => {
                console.error(`[KV GET] Request error:`, err);
                reject(err);
            });
            req.end();
        });
    }

    async kvPut(key, value) {
        return new Promise((resolve, reject) => {
            const body = typeof value === 'string' ? value : JSON.stringify(value);

            const options = {
                hostname: 'api.cloudflare.com',
                port: 443,
                path: `/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encodeURIComponent(key)}`,
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve();
                    } else {
                        reject(new Error(`KV PUT failed: ${res.statusCode} ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }

    async savePlayer(player) {
        const cached = this.players.get(player.username.toLowerCase());
        if (cached && cached.password && !player.password) {
            player.password = cached.password;
        }

        try {
            const key = `player:${player.username.toLowerCase()}`;
            await this.kvPut(key, player);
        } catch (err) {
            console.error('Error saving player:', err);
        }
    }

    async sendAndReceive(message) {
        switch (message.handler) {
            case 'playerRegister': {
                message.username = message.username.toLowerCase();

                const player = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
                player.username = message.username;
                player.password = message.password;
                player.id = Math.floor(Math.random() * 1000000);

                try {
                    const key = `player:${message.username}`;
                    const existing = await this.kvGet(key);

                    // Check if it's a valid player object
                    if (existing && existing.username) {
                        console.log(`[REGISTER DEBUG] Username taken. Requested: ${message.username}, Found: ${existing.username}`);
                        return { success: false, code: 4 }; // Username taken
                    }

                    await this.kvPut(key, player);
                    this.players.set(player.username, player);
                    return { success: true, player };
                } catch (err) {
                    console.error('Register error:', err);
                    return { success: false, code: 3 };
                }
            }
            case 'playerLogin': {
                message.username = message.username.toLowerCase();

                const cached = this.players.get(message.username);
                if (cached && cached.world) {
                    return { success: false, code: 4 }; // Already logged in
                }

                try {
                    const key = `player:${message.username}`;
                    const player = await this.kvGet(key);

                    if (!player || !player.username || player.password !== message.password) {
                        return { success: false, code: 3 }; // Invalid credentials
                    }

                    if (player.world) {
                        player.world = 0; // Reset stuck world
                    }

                    this.players.set(player.username, player);
                    this.playerUsernames.set(player.id, player.username);
                    player.world = 1;

                    return {
                        success: true,
                        code: 0,
                        player: player
                    };
                } catch (err) {
                    console.error('Login error:', err);
                    return { success: false, code: 3 };
                }
            }
            case 'playerUpdate': {
                delete message.handler;

                if (!message.username && message.id) {
                    message.username = this.playerUsernames.get(message.id);
                }

                if (!message.username) {
                    return { success: false };
                }

                message.loginDate = Date.now();

                const existing = this.players.get(message.username.toLowerCase());
                if (existing) {
                    if (!message.password) message.password = existing.password;
                    Object.assign(existing, message);
                    await this.savePlayer(existing);
                } else {
                    await this.savePlayer(message);
                }

                return { success: true };
            }
            case 'playerLogout': {
                const username = message.username.toLowerCase();
                const player = this.players.get(username);

                if (player) {
                    player.world = 0;
                    await this.savePlayer(player);
                    this.players.delete(username);
                }
                return { success: true };
            }
            case 'playerGetWorlds': {
                const usernameWorlds = {};
                for (const username of message.usernames) {
                    const p = this.players.get(username.toLowerCase());
                    if (p && p.world) {
                        usernameWorlds[username] = p.world;
                    }
                }
                return { usernameWorlds };
            }
            case 'playerMessage': {
                return { success: true };
            }
        }
    }

    async playerRegister({ username, password, ip }) {
        return this.sendAndReceive({
            handler: 'playerRegister',
            username,
            password,
            ip
        });
    }

    async playerLogin({ username, password }) {
        return this.sendAndReceive({
            handler: 'playerLogin',
            username,
            password
        });
    }

    playerLogout(username) {
        const player = this.players.get(username.toLowerCase());
        if (player) {
            player.world = 0;
            this.savePlayer(player);
        }
    }

    playerMessage(from, to, message) {
        // Handle local messaging
    }
}

module.exports = FlyDataClient;
