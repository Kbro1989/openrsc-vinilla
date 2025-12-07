const fs = require('fs');
const items = JSON.parse(fs.readFileSync('c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-data/config/items.json', 'utf8'));

const runes = [
    "Air", "Water", "Earth", "Fire", "Mind", "Body", "Life", "Death", "Nature", "Chaos", "Law", "Cosmic", "Blood", "Soul"
];

runes.forEach(rune => {
    items.forEach((item, index) => {
        if (item.name.toLowerCase().includes(rune.toLowerCase()) && item.name.toLowerCase().includes("rune")) {
            console.log(`${rune} Rune: ${index} (${item.name})`);
        }
    });
});
