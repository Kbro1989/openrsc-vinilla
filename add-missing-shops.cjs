const fs = require('fs');
const path = './rsc-server/rsc-data-local/shops.json';
const shops = JSON.parse(fs.readFileSync(path, 'utf8'));

const newShops = {
    "alfonses-shrimp-and-parrot": {
        "items": [
            { "id": 362, "amount": 5 },
            { "id": 551, "amount": 5 },
            { "id": 367, "amount": 5 },
            { "id": 373, "amount": 3 },
            { "id": 370, "amount": 2 }
        ],
        "sellMultiplier": 110, "buyMultiplier": 75, "delta": 2, "restock": 10000, "general": false
    },
    "baker-ardougne": {
        "items": [
            { "id": 138, "amount": 10 },
            { "id": 330, "amount": 3 },
            { "id": 336, "amount": 8 }
        ],
        "sellMultiplier": 100, "buyMultiplier": 80, "delta": 2, "restock": 15000, "general": false
    },
    "fur-merchant-ardougne": {
        "items": [
            { "id": 146, "amount": 3 },
            { "id": 541, "amount": 3 }
        ],
        "sellMultiplier": 120, "buyMultiplier": 95, "delta": 2, "restock": 15000, "general": false
    },
    "gem-merchant-ardougne": {
        "items": [
            { "id": 164, "amount": 2 },
            { "id": 163, "amount": 1 },
            { "id": 162, "amount": 1 },
            { "id": 161, "amount": 0 }
        ],
        "sellMultiplier": 150, "buyMultiplier": 80, "delta": 3, "restock": 300000, "general": false
    },
    "silver-merchant-ardougne": {
        "items": [
            { "id": 44, "amount": 2 },
            { "id": 383, "amount": 1 },
            { "id": 384, "amount": 1 }
        ],
        "sellMultiplier": 100, "buyMultiplier": 70, "delta": 2, "restock": 120000, "general": false
    },
    "spice-merchant-ardougne": {
        "items": [
            { "id": 707, "amount": 1 }
        ],
        "sellMultiplier": 100, "buyMultiplier": 70, "delta": 2, "restock": 15000, "general": false
    },
    "harrys-fishing-shack": {
        "items": [
            { "id": 376, "amount": 3 },
            { "id": 377, "amount": 3 },
            { "id": 379, "amount": 2 },
            { "id": 375, "amount": 2 },
            { "id": 380, "amount": 200 },
            { "id": 548, "amount": 5 }
        ],
        "sellMultiplier": 100, "buyMultiplier": 70, "delta": 2, "restock": 3000, "general": false
    }
};

let added = 0;
for (const [key, val] of Object.entries(newShops)) {
    if (!shops[key]) {
        shops[key] = val;
        console.log(`Added shop: ${key}`);
        added++;
    } else {
        console.log(`Shop exists: ${key}`);
    }
}

if (added > 0) {
    fs.writeFileSync(path, JSON.stringify(shops, null, 4));
    console.log(`Saved ${added} new shops.`);
} else {
    console.log("No changes needed.");
}
