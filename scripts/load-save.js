// Try to use global fetch (Node 18+), otherwise require node-fetch
const fetch = global.fetch || require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8788';

async function loadSave() {
    const filePath = process.argv[2];

    if (!filePath) {
        console.error('Usage: npm run load-save <path-to-save-file.json>');
        process.exit(1);
    }

    const absolutePath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: File not found at ${absolutePath}`);
        process.exit(1);
    }

    console.log(`Reading save file from: ${absolutePath}`);

    try {
        const fileContent = fs.readFileSync(absolutePath, 'utf8');
        const playerData = JSON.parse(fileContent);

        console.log(`Loaded data for user: ${playerData.username}`);
        console.log(`Injecting into KV via ${BASE_URL}/api/player/save...`);

        const response = await fetch(`${BASE_URL}/api/player/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData)
        });

        if (response.status === 200) {
            const result = await response.json();
            if (result.success) {
                console.log('✅ Success! Player state updated in KV.');
            } else {
                console.error('❌ Server returned failure:', result);
            }
        } else {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('Response:', text);
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    }
}

loadSave();
