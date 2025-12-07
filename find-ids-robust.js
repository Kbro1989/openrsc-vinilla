const fs = require('fs');
const path = require('path');

const loadJson = (p) => {
    try {
        const content = fs.readFileSync(p, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`Error loading ${p}:`, e.message);
        return [];
    }
};

const items = loadJson('./rsc-server/rsc-data-local/config/items.json');
const npcs = loadJson('./rsc-server/rsc-data-local/config/npcs.json');

console.log('Items:', items.length);
console.log('NPCs:', npcs.length);

function findItem(name) {
    // Find exact or partial match
    const id = items.findIndex(i => i.name && i.name.toLowerCase() === name.toLowerCase());
    console.log(`Item: "${name}" -> ${id}`);

    // If not found, search partial
    if (id === -1) {
        const partial = items.findIndex(i => i.name && i.name.toLowerCase().includes(name.toLowerCase()));
        if (partial !== -1) console.log(`  Unknown exact match. Partial: "${items[partial].name}" -> ${partial}`);
    }
}

function findNpc(name) {
    const id = npcs.findIndex(n => n.name && n.name.toLowerCase() === name.toLowerCase());
    console.log(`NPC: "${name}" -> ${id}`);
}

findNpc('Zenesha');
findItem('Bronze Plate Mail Body');
findItem('Iron Plate Mail Body');
findItem('Steel Plate Mail Body');
findItem('Black Plate Mail Body');
findItem('Mithril Plate Mail Body');
findItem('Mithril Platemail Body');
