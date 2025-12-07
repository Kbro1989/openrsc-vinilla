const fs = require('fs');
const path = 'c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-data/config/items.json';
const items = JSON.parse(fs.readFileSync(path, 'utf8'));

const newItems = [
    {
        "name": "Soul Rune",
        "description": "Used for high level curse spells",
        "command": "",
        "sprite": 37,
        "price": 50,
        "stackable": true,
        "special": false,
        "equip": null,
        "colour": "rgb(200, 200, 200)",
        "untradeable": false,
        "members": true
    }
];

items.push(...newItems);

fs.writeFileSync(path, JSON.stringify(items, null, 4));
console.log('Soul Rune appended successfully.');
