console.log('Loading ./browser-socket...');
const BrowserSocket = require('./browser-socket');
const RSCSocket = require('@2003scape/rsc-socket');
const World = require('./model/world');
const packetHandlers = require('./packet-handlers');
const toBuffer = process.browser ? require('typedarray-to-buffer') : undefined;

// Cloudflare Worker Mode: No global requires for Node modules
let net, ws, bole;
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'worker') {
    try {
        net = require('net');
        ws = require('ws');
        bole = require('bole');
    } catch (e) { }
}

const log = bole ? bole('server') : {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.log,
};

console.log('Loading data-client...');
const DataClient = process.browser
    ? require('./browser-data-client')
    : require('./data-client');


class Server {
    constructor(config, env) {
        this.config = config;
        this.env = env; // Store env for KV access in Durable Objects
        this.isBrowser = !!process.browser;
        this.isDurableObject = !!(env && env.KV && !process.browser); // Detect DO mode

        this.world = new World(this);
        this.dataClient = new DataClient(this);

        this.incomingMessages = new Map();
        this.outgoingMessages = [];

        if (process.browser) {
            this.browserSockets = {};
        }
    }

    loadPacketHandlers() {
        this.handlers = {};

        for (const file of Object.keys(packetHandlers)) {
            const handlers = packetHandlers[file];

            for (const handlerName of Object.keys(handlers)) {
                this.handlers[handlerName] = handlers[handlerName];
            }
        }
    }

    handleConnection(socket) {
        socket = new RSCSocket(socket);
        socket.setTimeout(5000);
        socket.server = this;

        this.incomingMessages.set(socket, []);

        socket.on('error', (err) => log.error(err));
        socket.on('timeout', () => socket.close());

        socket.on('message', async (message) => {
            if (
                !socket.player &&
                !/register|login|session|closeConnection/.test(message.type)
            ) {
                log.warn(`${socket} sending ${message.type} before login`);
                socket.close();
                return;
            }

            const queue = this.incomingMessages.get(socket);
            //const messagesSent = queue.length;

            log.debug(`incoming message from ${socket}`, message);
            queue.push(message);

            if (queue.length >= 10) {
                queue.shift();
            }
        });

        socket.on('close', async () => {
            if (socket.player) {
                if (socket.player.loggedIn) {
                    await socket.player.logout();
                }

                delete socket.player;
                delete socket.server;
            }

            socket.removeAllListeners();
            this.incomingMessages.delete(this);
            log.info(`${socket} disconnected`);
        });

        log.info(`${socket} connected`);
    }

    bindTCP() {
        this.tcpServer = new net.Server();

        this.tcpServer.on('error', (err) => log.error(err));

        this.tcpServer.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        return new Promise((resolve, reject) => {
            this.tcpServer.once('error', reject);

            this.tcpServer.once('listening', () => {
                this.tcpServer.removeListener('error', reject);
                log.info(`listening for TCP connections on port ${port}`);
                resolve();
            });

            const port = this.config.tcpPort;
            this.tcpServer.listen({ port });
        });
    }

    bindWebSocket(httpServer) {
        if (httpServer) {
            this.websocketServer = new ws.Server({ server: httpServer });
            log.info('attached websocket server to existing http server');
        } else {
            const port = this.config.websocketPort;
            this.websocketServer = new ws.Server({ port });
            log.info(`listening for websocket connections on port ${port}`);
        }

        this.websocketServer.on('error', (err) => log.error(err));

        this.websocketServer.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }

    bindWebWorker() {
        addEventListener('message', (e) => {
            switch (e.data.type) {
                case 'connect': {
                    const browserSocket = new BrowserSocket(e.data.id);
                    this.browserSockets[browserSocket.id] = browserSocket;
                    this.handleConnection(browserSocket);
                    break;
                }
                case 'disconnect': {
                    const browserSocket = this.browserSockets[e.data.id];
                    browserSocket.emit('close', false);
                    delete this.browserSockets[browserSocket.id];
                    break;
                }
                case 'data': {
                    const browserSocket = this.browserSockets[e.data.id];
                    browserSocket.emit('data', toBuffer(e.data.data));
                    break;
                }
            }
        });
    }

    readMessages() {
        for (const [socket, queue] of this.incomingMessages) {
            for (const message of queue) {
                const handler = this.handlers[message.type];

                if (!handler) {
                    log.warn(`${socket} no handler for type ${message.type}`);
                    continue;
                }

                handler(socket, message).catch((e) => {
                    log.error(e, socket.toString());
                });
            }

            queue.length = 0;
        }
    }

    sendMessages() {
        while (this.outgoingMessages.length) {
            const { socket, message } = this.outgoingMessages.shift();
            socket.sendMessage(message);
        }
    }

    async init(httpServer) {
        try {
            if (!this.config.skipDataServer) {
                await this.dataClient.init();
            } else {
                log.info('Skipping DataClient initialization (running in standalone/KV mode)');
            }

            await this.world.loadData();
            this.world.tick();

            this.loadPacketHandlers();

            if (this.isDurableObject) {
                // Durable Object mode - connections are handled externally
                log.info('Running in Durable Object mode');
                log.info(`Server initialized: World=${this.config.worldID}, Members=${this.config.members}`);
            } else if (this.isBrowser) {
                this.bindWebWorker();
                postMessage({ type: 'ready' });
            } else {
                if (!httpServer) {
                    await this.bindTCP();
                }
                this.bindWebSocket(httpServer);
            }
        } catch (e) {
            console.error(e);
            log.error(e);
            if (!this.isDurableObject && typeof process !== 'undefined' && process.exit) {
                process.exit(1);
            } else {
                throw e; // Re-throw in DO mode or environment without process.exit
            }
        }
    }
}

module.exports = Server;
