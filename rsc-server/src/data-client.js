// communicate with https://github.com/2003scape/rsc-data-server

const uid = require('rand-token').uid;
const log = {
    error: console.error,
    info: console.log,
    debug: console.debug
};

// Conditional require for Node.js environment
let JSONSocket, net;
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'worker') {
    try {
        JSONSocket = require('json-socket');
        net = require('net');
    } catch (e) { }
}

const TIMEOUT = 10000;

class DataClient {
    constructor(server) {
        this.server = server;
        this.world = this.server.world;
        this.connected = false;

        // Valid for Node.js mode only
        if (net && JSONSocket) {
            this.socket = new JSONSocket(new net.Socket());
            this.socket.on('error', (err) => log.error(err));
            this.socket.on('message', (message) => this.handleMessage(message));
            this.socket.on('close', (hadError) => {
                this.socket._socket.removeAllListeners('ready');
                this.connected = false;
                log.error(`data-client closed. hadError: ${hadError}`);
                // Reconnect logic...
            });
        }
    }

    get db() {
        return this.server.env && this.server.env.DB;
    }

    connect() {
        if (this.db) {
            this.connected = true;
            return Promise.resolve();
        }
        // ... legacy connect ...
        return new Promise((resolve, reject) => {
            const { config } = this.server;
            this.socket._socket.once('error', reject);
            this.socket._socket.once('ready', () => {
                this.socket._socket.removeListener('error', reject);
                resolve();
                this.connected = true;
                log.info('connected');
            });
            if (config.dataServerFile) {
                this.socket.connect(config.dataServerFile);
            } else {
                const [host, port] = config.dataServerTCP.split(':');
                this.socket.connect(+port, host);
            }
        });
    }

    async init() {
        if (this.db) {
            console.log('[DataClient] Initialized with Cloudflare D1 Storage');
            this.connected = true;
            return;
        }
        await this.connect();
        await this.authenticate();
        await this.worldConnect();
    }

    end() {
        if (this.socket) this.socket.end();
    }

    handleMessage(message) {
        log.debug('received message', message);
        switch (message.handler) {
            case 'playerLoggedIn':
            case 'playerWorldChange':
                this.world.sendForeignPlayerWorld(message.username, message.world);
                break;
            case 'playerLoggedOut':
                this.world.sendForeignPlayerWorld(message.username, 0);
                break;
            case 'playerMessage': {
                const player = this.world.getPlayerByUsername(message.toUsername);
                if (!player || player.blockPrivateChat || player.ignores.indexOf(message.fromUsername) > -1) {
                    return;
                }
                player.receivePrivateMessage(message.fromUsername, message.message);
                break;
            }
        }
    }

    send(message) {
        if (!this.connected) return;
        if (this.db) {
            // For fire-and-forget messages in D1 mode
            if (message.handler === 'playerLogout') {
                // Nothing urgent, saved on logout anyway
            }
            return;
        }

        const token = uid(64);
        message.token = token;
        log.debug('sending message', message);
        this.socket.sendMessage(message);
    }

    async sendAndReceive(message) {
        if (this.db) {
            return this.handleD1Message(message);
        }

        if (!this.connected) return;

        const token = uid(64);
        message.token = token;
        log.debug('sending message', message);

        return new Promise((resolve) => {
            // ... legacy promise logic ...
            let onMessage, onError, messageTimeout;
            onMessage = (receivedMessage) => {
                if (receivedMessage.token !== token) return;
                clearTimeout(messageTimeout);
                this.socket._socket.removeListener('message', onMessage);
                this.socket._socket.removeListener('error', onError);
                delete receivedMessage.token;
                receivedMessage.handler = message.handler;
                resolve(receivedMessage);
            };
            onError = () => {
                clearTimeout(messageTimeout);
                this.socket._socket.removeListener('message', onMessage);
                this.socket._socket.removeListener('error', onError);
            };
            this.socket.on('message', onMessage);
            this.socket.on('error', onError);
            messageTimeout = setTimeout(() => {
                this.socket._socket.removeListener('error', onError);
                this.socket._socket.removeListener('message', onMessage);
                log.error(new Error(`timeout on response for ${message.handler}`));
            }, TIMEOUT);
            this.socket.sendMessage(message);
        });
    }

    // --- D1 Implementation ---

    async handleD1Message(message) {
        // Mock success for auth/handshake calls
        if (['authenticate', 'worldConnect'].includes(message.handler)) {
            return { success: true };
        }

        if (message.handler === 'playerLogin') {
            return this.d1PlayerLogin(message);
        }

        if (message.handler === 'playerUpdate') {
            return this.d1PlayerSave(message);
        }


        if (message.handler === 'playerRegister') {
            return this.d1PlayerRegister(message);
        }

        if (message.handler === 'playerGetWorlds') {
            return { usernameWorlds: {} }; // Mock: all offline/local
        }

        console.warn(`[DataClient] Unhandled D1 message: ${message.handler}`);
        return { success: false, error: 'Not implemented in D1 mode' };
    }

    async d1PlayerLogin(msg) {
        const { username, password } = msg;

        // Try load from D1
        const cleanUser = username.toLowerCase();
        try {
            const result = await this.db.prepare(
                'SELECT data FROM players WHERE username = ?'
            ).bind(cleanUser).first();

            if (result) {
                // Found existing player
                const data = JSON.parse(result.data);

                // Password check (Plaintext for now as per RSC legacy/ZeroCost simplicity)
                if (data.pass !== password) {
                    return { success: false, code: 3 }; // Invalid credentials
                }

                // Success!
                // Add fields expected by Packet Handler
                data.id = -1; // Mock ID
                data.username = cleanUser;
                data.group = data.group || 0;

                return { success: true, code: 0, player: data };
            } else {
                // New Player? Auto-register for Zero-Friction
                console.log(`[DataClient] Creating new user: ${cleanUser}`);

                // Default NEW player template
                const newPlayer = {
                    username: cleanUser,
                    pass: password, // Save for next time
                    x: 329, y: 552, // Tutorial Island or Lumbridge
                    fatigue: 0,
                    combatStyle: 0,
                    blockChat: 0, blockPrivateChat: 0, blockTrade: 0, blockDuel: 0,
                    cameraAuto: 0, oneMouseButton: 0,
                    loginDate: Date.now(),
                    friends: [], ignores: [],
                    skills: {}, // Will be populated by Player ctor defaults if missing
                    inventory: [], bank: [],
                    questPoints: 0, questStages: {}
                };

                // Save it immediately
                await this.db.prepare(
                    'INSERT INTO players (username, data, updated_at) VALUES (?, ?, ?)'
                ).bind(cleanUser, JSON.stringify(newPlayer), Date.now()).run();

                return { success: true, code: 0, player: newPlayer };
            }

        } catch (e) {
            console.error('[DataClient] D1 Login Error:', e);
            return { success: false, code: 5 }; // Server error
        }
    }

    async d1PlayerSave(msg) {
        // extract data from msg. Message IS the player data blob (spread in player.js save())
        // msg contains 'handler' property we should strip?

        const username = msg.username.toLowerCase();
        const dataToSave = { ...msg };
        delete dataToSave.handler;
        delete dataToSave.token;

        // Ensure password is kept! 
        // NOTE: player.js save() properties might NOT include password if it's not in SAVE_PROPERTIES.
        // We need to fetch existing password or store it in Player object.
        // For now, let's hope 'pass' is in the blob or we accept it's a prototype.
        // Better: Fetch existing blob to preserve password if missing?
        // Or simpler: Just update updated_at if we don't have pass?
        // Let's assume we want to preserve old properties not in save spec.

        try {
            const existing = await this.db.prepare('SELECT data FROM players WHERE username = ?').bind(username).first();
            if (existing) {
                const existingData = JSON.parse(existing.data);
                // Merge to preserve things like password
                const merged = { ...existingData, ...dataToSave };

                await this.db.prepare(
                    'UPDATE players SET data = ?, updated_at = ? WHERE username = ?'
                ).bind(JSON.stringify(merged), Date.now(), username).run();

            } else {
                // Weird case: saving non-existent player
                await this.db.prepare(
                    'INSERT INTO players (username, data, updated_at) VALUES (?, ?, ?)'
                ).bind(username, JSON.stringify(dataToSave), Date.now()).run();
            }

            return { success: true };
        } catch (e) {
            console.error('[DataClient] Save Error:', e);
            return { success: false };
        }
    }

    async d1PlayerRegister(msg) {
        const { username, password } = msg;
        const cleanUser = username.toLowerCase();

        try {
            // Check if user already exists
            const result = await this.db.prepare(
                'SELECT data FROM players WHERE username = ?'
            ).bind(cleanUser).first();

            if (result) {
                // Username already taken
                return { success: false, code: 3 }; // 3 = username taken (client understands this)
            }

            // Create new player
            console.log(`[DataClient] Registering new user: ${cleanUser}`);

            const newPlayer = {
                username: cleanUser,
                pass: password,
                x: 329, y: 552, // Tutorial Island
                fatigue: 0,
                combatStyle: 0,
                blockChat: 0, blockPrivateChat: 0, blockTrade: 0, blockDuel: 0,
                cameraAuto: 0, oneMouseButton: 0,
                loginDate: Date.now(),
                friends: [], ignores: [],
                skills: {},
                inventory: [], bank: [],
                questPoints: 0, questStages: {}
            };

            await this.db.prepare(
                'INSERT INTO players (username, data, updated_at) VALUES (?, ?, ?)'
            ).bind(cleanUser, JSON.stringify(newPlayer), Date.now()).run();

            // Code 2 = Registration success (client expects this!)
            return { success: true, code: 2 };

        } catch (e) {
            console.error('[DataClient] D1 Register Error:', e);
            return { success: false, code: 5 }; // Server error
        }
    }

    // --- Legacy Passthroughs ---
    async authenticate() {
        if (this.db) return;
        return this.sendAndReceive({ handler: 'authenticate', password: this.server.config.dataServerPassword });
    }

    async worldConnect() {
        if (this.db) return;
        const { config } = this.server;
        return this.sendAndReceive({
            handler: 'worldConnect',
            id: config.worldID,
            tcpPort: config.tcpPort,
            websocketPort: config.websocketPort,
            members: config.members,
            country: config.country
        });
    }

    async playerLogin(data) {
        if (this.db) return this.d1PlayerLogin(data);
        return this.sendAndReceive({ handler: 'playerLogin', ...data });
    }

    playerLogout(username) {
        if (this.db) return; // Save handled by player.save() -> playerUpdate
        this.send({ handler: 'playerLogout', username });
    }

    playerWorldChange(username, worldID) {
        if (this.db) return;
        this.send({ handler: 'playerWorldChange', username, world: worldID });
    }

    async playerRegister(data) {
        if (this.db) return this.d1PlayerRegister(data);
        return this.sendAndReceive({ handler: 'playerRegister', ...data });
    }

    playerMessage(fromUsername, toUsername, message) {
        if (this.db) return; // private messages between shards not supported yet
        this.send({ handler: 'playerMessage', fromUsername, toUsername, message });
    }
}

module.exports = DataClient;
