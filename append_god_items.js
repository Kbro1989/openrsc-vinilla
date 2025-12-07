const fs = require('fs');
const path = 'c:/Users/Destiny/Desktop/ai-architect-mmorpg/copy-of-rsc-evolution-ai/rsc-cloudflare/rsc-data/config/items.json';
const items = JSON.parse(fs.readFileSync(path, 'utf8'));

const newItems = [
    {
        "name": "Blood Rune",
        "description": "Used for high level missile spells",
        "command": "",
        "sprite": 37,
        "price": 50,
        "stackable": true,
        "special": false,
        "equip": null,
        "colour": "rgb(200, 0, 0)",
        "untradeable": false,
        "members": true
    },
    {
        "name": "Staff of Guthix",
        "description": "A staff of the god Guthix",
        "command": "",
        "sprite": 91,
        "price": 80000,
        "stackable": false,
        "special": false,
        "equip": [
            "right-hand"
        ],
        "colour": "rgb(0, 255, 0)",
        "untradeable": false,
        "members": true
    },
    {
        "name": "Staff of Saradomin",
        "description": "A staff of the god Saradomin",
        "command": "",
        "sprite": 91,
        "price": 80000,
        "stackable": false,
        "special": false,
        "equip": [
            "right-hand"
        ],
        "colour": "rgb(0, 0, 255)",
        "untradeable": false,
        "members": true
    },
    {
        "name": "Staff of Zamorak",
        "description": "A staff of the god Zamorak",
        "command": "",
        "sprite": 91,
        "price": 80000,
        "stackable": false,
        "special": false,
        "equip": [
            "right-hand"
        ],
        "colour": "rgb(255, 0, 0)",
        "untradeable": false,
        "members": true
    },
    {
        "name": "Cape of Guthix",
        "description": "The cape of Guthix",
        "command": "",
        "sprite": 59,
        "price": 0,
        "stackable": false,
        "special": false,
        "equip": [
            "cape"
        ],
        "colour": "rgb(0, 255, 0)",
        "untradeable": true,
        "members": true
    },
    {
        "name": "Cape of Saradomin",
        "description": "The cape of Saradomin",
        "command": "",
        "sprite": 59,
        "price": 0,
        "stackable": false,
        "special": false,
        "equip": [
            "cape"
        ],
        "colour": "rgb(0, 0, 255)",
        "untradeable": true,
        "members": true
    },
    {
        "name": "Cape of Zamorak",
        "description": "The cape of Zamorak",
        "command": "",
        "sprite": 59,
        "price": 0,
        "stackable": false,
        "special": false,
        "equip": [
            "cape"
        ],
        "colour": "rgb(255, 0, 0)",
        "untradeable": true,
        "members": true
    }
];

items.push(...newItems);

fs.writeFileSync(path, JSON.stringify(items, null, 4));
console.log('Items appended successfully.');
