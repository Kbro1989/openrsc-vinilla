const log = require('bole')('data-client');

const DEFAULT_PLAYER = {
    username: '',
    password: '',
    group: 0, // 0=player, 2=mod, 3=admin
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
        hits: { current: 9, experience: 2304 }, // RSC Level 9 with 4x multiplier
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

class BrowserDataClient {
    constructor(server) {
        this.server = server;
        this.world = this.server.world;
        this.connected = true;

        // Check if we have direct KV access (Durable Object mode)
        this.isDurableObject = !!(server.env && server.env.KV);
        this.env = server.env;

        // { playerID: username }
        this.playerUsernames = new Map();
        // Cache of loaded players { username: playerObj }
        this.players = new Map();

        console.log('BrowserDataClient instance:', {
            isDurableObject: this.isDurableObject,
            hasKV: !!this.env?.KV
        });
    }

    async init() {
        if (this.isDurableObject) {
            log.info('BrowserDataClient initialized (Durable Object KV mode)');
            console.log('%c RSC DURABLE OBJECT KV MODE ', 'background: #ff6600; color: white; font-size: 20px');
        } else {
            log.info('BrowserDataClient initialized (Browser Worker memory mode)');
            console.log('%c RSC WORKER MEMORY MODE ', 'background: #222; color: #bada55; font-size: 20px');
            // Note: Workers can't access localStorage, using in-memory Map
        }
    }

    loadFromLocalStorage() {
        // Workers can't access localStorage - skip
        log.info('loaded 0 players (Worker memory mode)');
    }

    saveToLocalStorage(player) {
        // Workers can't access localStorage - skip
    }

    async load() {
        // No-op
    }

    async save() {
        // No-op
    }

    async savePlayer(player) {
        // We need the password to save it back
        const cached = this.players.get(player.username.toLowerCase());
        if (cached && cached.password && !player.password) {
            player.password = cached.password;
        }

        try {
            if (this.isDurableObject) {
                // Direct KV access in Durable Object mode
                const key = `player:${player.username.toLowerCase()}`;
                await this.env.KV.put(key, JSON.stringify(player));
            } else {
                // Browser fetch mode
                await fetch('/api/player/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(player)
                });
            }
        } catch (err) {
            console.error('Error saving player:', err);
        }
    }

    /**
     * Get player from KV storage (Durable Object mode only)
     */
    async getPlayerFromKV(username) {
        if (!this.isDurableObject) {
            throw new Error('getPlayerFromKV only available in Durable Object mode');
        }
        const key = `player:${username.toLowerCase()}`;
        const data = await this.env.KV.get(key, 'json');
        return data;
    }

    /**
     * Save player to KV storage (Durable Object mode only)
     */
    async savePlayerToKV(player) {
        if (!this.isDurableObject) {
            throw new Error('savePlayerToKV only available in Durable Object mode');
        }
        const key = `player:${player.username.toLowerCase()}`;
        await this.env.KV.put(key, JSON.stringify(player));
    }


    async sendAndReceive(message) {
        switch (message.handler) {
            case 'playerRegister': {
                message.username = message.username.toLowerCase();

                const player = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
                player.username = message.username;
                player.password = message.password;
                player.id = Math.floor(Math.random() * 1000000); // Random ID for now

                try {
                    if (this.isDurableObject) {
                        // Direct KV check for existing player
                        const existing = await this.getPlayerFromKV(message.username);
                        if (existing) {
                            return { success: false, code: 4 }; // Username taken
                        }

                        // Save new player to KV
                        await this.savePlayerToKV(player);
                        this.players.set(player.username, player);
                        return { success: true, player };
                    } else {
                        // Browser Worker mode - use in-memory Map
                        const existing = this.players.get(message.username);
                        if (existing) {
                            return { success: false, code: 4 }; // Username taken
                        }

                        // Save to in-memory cache
                        this.players.set(player.username, player);
                        this.playerUsernames.set(player.id, player.username);
                        log.info(`Registered new player: ${player.username}`);
                        return { success: true, code: 2, player }; // code 2 = success
                    }
                } catch (err) {
                    console.error('Register error:', err);
                    return { success: false, code: 3 };
                }
            }
            case 'playerLogin': {
                message.username = message.username.toLowerCase();

                // Check if already logged in locally
                const cached = this.players.get(message.username);
                if (cached && cached.world) {
                    return { success: false, code: 4 };
                }

                try {
                    let player;

                    if (this.isDurableObject) {
                        // Direct KV access
                        player = await this.getPlayerFromKV(message.username);
                    } else {
                        // Browser Fetch Mode (Authentic Client Shared Persistence)
                        try {
                            const response = await fetch(`/api/player/load?username=${encodeURIComponent(message.username)}`);
                            if (response.ok) {
                                player = await response.json();
                                log.info(`Player loaded from API: ${player.username}`);
                            } else if (response.status !== 404) {
                                console.error('API Load Error:', response.status);
                            }
                        } catch (e) {
                            console.error('Fetch error:', e);
                        }
                    }

                    if (!player || player.password !== message.password) {
                        return { success: false, code: 3 }; // Invalid credentials
                    }

                    if (player.world) {
                        // Force reset world if stuck
                        player.world = 0;
                    }

                    this.players.set(player.username, player);
                    this.playerUsernames.set(player.id, player.username);

                    player.world = 1;

                    return {
                        success: true,
                        code: 0, // 0 = success
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
                    console.error('playerUpdate missing username', message);
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
            case 'playerLoad': {
                // This is used by the server to get the player object after login
                const username = message.username.toLowerCase();
                const player = this.players.get(username);
                return { success: !!player, player };
            }
            case 'playerSave': {
                const player = message.player;
                await this.savePlayer(player);
                return { success: true };
            }
            case 'playerGetWorlds': {
                // Standalone mode - just return empty or local
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
                // Local message handling if needed
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
        // Called by server when socket closes
        const player = this.players.get(username.toLowerCase());
        if (player) {
            player.world = 0;
            this.savePlayer(player);
        }
    }

    playerMessage(from, to, message) {
        // Handle local messaging if both players are on this server (which they are)
        // This would require access to the World object to find the other player
        // For now, basic implementation
    }
}

module.exports = BrowserDataClient;

