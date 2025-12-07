const items = require('./rsc-server/rsc-data-local/config/items.json');
const npcs = require('./rsc-server/rsc-data-local/config/npcs.json');

console.log('Items array?', Array.isArray(items));
console.log('NPCs array?', Array.isArray(npcs));

function findItem(name) {
    const id = items.findIndex(i => i.name.toLowerCase() === name.toLowerCase());
    console.log(`Item: ${name} -> ${id}`);
}

function findNpc(name) {
    const id = npcs.findIndex(n => n.name.toLowerCase() === name.toLowerCase());
    console.log(`NPC: ${name} -> ${id}`);
}

findNpc('Zenesha');
findItem('Bronze Plate Mail Body');
findItem('Iron Plate Mail Body');
findItem('Steel Plate Mail Body');
findItem('Black Plate Mail Body');
findItem('Mithril Plate Mail Body');
