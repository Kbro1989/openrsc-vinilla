const fs = require('fs');
const items = JSON.parse(fs.readFileSync('c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-data/config/items.json', 'utf8'));

const targets = [
    "Blood",
    "Saradomin",
    "Guthix",
    "Zamorak"
];

targets.forEach(target => {
    items.forEach((item, index) => {
        if (item.name.toLowerCase().includes(target.toLowerCase())) {
            console.log(`${index}: ${item.name}`);
        }
    });
});
