const https = require('https');

const ACCOUNT_ID = '6872653edcee9c787c1b783173793';
const NAMESPACE_ID = 'YOUR_KV_NAMESPACE_ID'; // You'll need to get this from Cloudflare dashboard
const API_TOKEN = 'YOUR_CLOUDFLARE_API_TOKEN'; // You'll need your API token

const username = process.argv[2];

if (!username) {
    console.error('Usage: node reset-player.js <username>');
    process.exit(1);
}

const playerKey = `player:${username}`;

const options = {
    hostname: 'api.cloudflare.com',
    port: 443,
    path: `/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${playerKey}`,
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log(`Successfully deleted player data for: ${username}`);
            console.log('Next login will create a fresh character with correct stats');
        } else {
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end();
