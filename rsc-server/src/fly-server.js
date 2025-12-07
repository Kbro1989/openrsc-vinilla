/**
 * Fly.io Server Entry Point
 * 
 * This is the main server file for running RSC on Fly.io
 * It includes state synchronization to Cloudflare KV for backup/failover
 */

console.log('Loading ./server...');
const Server = require('./server');
console.log('Loading ./state-sync-client...');
const StateSyncClient = require('./state-sync-client');
console.log('Loading ./fly-data-client...');
const FlyDataClient = require('./fly-data-client');
console.log('Loading http...');
const http = require('http');

// Configuration from environment variables
console.log('Loading ../config.json...');
const defaultConfig = require('../config.json');
const packageJson = require('../package.json');

// Configuration from environment variables, merging with default config
const config = {
    ...defaultConfig,
    worldID: parseInt(process.env.WORLD_ID || '1'),
    members: process.env.MEMBERS === 'true',
    tcpPort: null,
    websocketPort: parseInt(process.env.PORT || '43594'),
    skipDataServer: true
};

// State sync configuration
const stateSyncConfig = {
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID || '6872653edcee9c791787c1b783173793',
    cloudflareKvNamespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID || 'f2881801ac59415a86236d0841f27103',
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
    syncInterval: parseInt(process.env.STATE_SYNC_INTERVAL || '30000')
};

console.log('========================================');
console.log('🚀 Starting RSC Server on Fly.io');
console.log('========================================');
console.log(`World ID: ${config.worldID}`);
console.log(`Members: ${config.members ? 'Yes' : 'No (F2P only)'}`);
console.log(`WebSocket Port: ${config.websocketPort}`);
console.log(`State Sync: ${stateSyncConfig.syncInterval / 1000}s`);
console.log('========================================');

// Create server instance
const server = new Server(config);

// Replace default DataClient with FlyDataClient for Cloudflare KV support
if (stateSyncConfig.cloudflareApiToken) {
    server.dataClient = new FlyDataClient(server, stateSyncConfig);
    console.log('✅ FlyDataClient activated (Cloudflare KV for player data)');
} else {
    console.warn('⚠️  No Cloudflare API token - player persistence disabled!');
}

// Create state sync client (if API token is provided)
let stateSync = null;
if (stateSyncConfig.cloudflareApiToken) {
    stateSync = new StateSyncClient(stateSyncConfig);
    console.log('✅ State sync to Cloudflare KV enabled');
} else {
    console.warn('⚠️  No Cloudflare API token - state sync disabled');
}

// Health check HTTP server
const healthServer = http.createServer((req, res) => {
    if (req.url === '/health') {
        const status = {
            status: 'healthy',
            uptime: process.uptime(),
            players: server.world ? server.world.players.length : 0,
            players: server.world ? server.world.players.length : 0,
            timestamp: new Date().toISOString(),
            version: packageJson.version
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Start the server
async function start() {
    try {
        // Start health check endpoint on same port
        healthServer.listen(43594, '0.0.0.0', async () => {
            console.log('✅ Health check endpoint ready at /health');

            // Initialize RSC server, passing the http server to share the port
            try {
                await server.init(healthServer);
            } catch (err) {
                console.error('❌ Server init failed:', err);
                process.exit(1);
            }
        });

        // Start state sync if enabled
        if (stateSync) {
            stateSync.start(server);
        }

        console.log('========================================');
        console.log('✅ RSC Server ready! Players can connect.');
        console.log('========================================');

    } catch (err) {
        console.error('❌ Server failed to start:', err);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('📦 SIGTERM received, shutting down gracefully...');

    if (stateSync) {
        // Final sync before shutdown
        await stateSync.syncAllPlayers();
        stateSync.stop();
    }

    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📦 SIGINT received, shutting down gracefully...');

    if (stateSync) {
        await stateSync.syncAllPlayers();
        stateSync.stop();
    }

    process.exit(0);
});

// Start the server
start();
