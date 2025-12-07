const fs = require('fs');

const loadJson = (p) => {
    try {
        const content = fs.readFileSync(p, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
};

const items = loadJson('./rsc-server/rsc-data-local/config/items.json');
const npcs = loadJson('./rsc-server/rsc-data-local/config/npcs.json');

console.log('Items:', items.length);
console.log('NPCs:', npcs.length);

function findItem(name) {
    items.forEach((item, index) => {
        if (item.name && item.name.toLowerCase().includes(name.toLowerCase())) {
            console.log(`Item: "${item.name}" -> ${index}`);
        }
    });
}

function findNpc(name) {
    npcs.forEach((npc, index) => {
        if (npc.name && npc.name.toLowerCase().includes(name.toLowerCase())) {
            console.log(`NPC: "${npc.name}" -> ${index}`);
        }
    });
}

findNpc('Weapon'); // "WeaponMaster"
findNpc('Master');
findItem('Phoenix Crossbow');
findItem('Crossbow');
