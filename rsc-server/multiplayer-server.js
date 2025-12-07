/**
 * Local Multiplayer Server for RSC
 * Run this to have multiple players connect to the same world
 */

const Server = require('./src/server');

const config = {
    worldID: 1,
    members: false,
    port: 43594,
    host: '127.0.0.1'
};

console.log('Starting RSC Multiplayer Server...');
console.log(`Port: ${config.port}`);
console.log(`Members: ${config.members ? 'Yes' : 'No (F2P only)'}`);

const server = new Server(config);

server.start().then(() => {
    console.log('✅ Server ready! Players can now connect.');
    console.log(`Connect at: ws://localhost:${config.port}`);
}).catch(err => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
});
