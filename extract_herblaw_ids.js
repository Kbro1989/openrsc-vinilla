const fs = require('fs');
const items = require('./rsc-data/config/items.json');

const herbs = [];
const potions = [];
const others = [];

items.forEach((item, index) => {
    const name = item.name.toLowerCase();
    if (name.includes('herb')) {
        herbs.push({ id: index, name: item.name });
    } else if (name.includes('potion') || name.includes('mix')) {
        potions.push({ id: index, name: item.name });
    } else if (name.includes('vial') || name.includes('eye of newt') || name.includes('unicorn') || name.includes('limpwurt') || name.includes('spider') || name.includes('snape') || name.includes('scale') || name.includes('berries') || name.includes('fungus') || name.includes('wine of zamorak') || name.includes('cactus') || name.includes('nest')) {
        others.push({ id: index, name: item.name });
    }
});

console.log('--- HERBS ---');
herbs.forEach(h => console.log(`${h.id}: ${h.name}`));
console.log('\n--- POTIONS ---');
potions.forEach(p => console.log(`${p.id}: ${p.name}`));
console.log('\n--- OTHERS ---');
others.forEach(o => console.log(`${o.id}: ${o.name}`));
