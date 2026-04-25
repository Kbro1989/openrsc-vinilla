const fs = require('fs');
const items = require('./rsc-data/config/items.json');

const nameToId = new Map();
items.forEach((item, index) => {
    const name = item.name.toLowerCase();
    if (!nameToId.has(name)) {
        nameToId.set(name, index);
    }
});

console.log('Lobster:', nameToId.get('lobster'));
console.log('Swordfish:', nameToId.get('swordfish'));
console.log('Shark:', nameToId.get('shark'));
console.log('Meat Pizza:', nameToId.get('meat pizza'));
console.log('Dragon Bitter:', nameToId.get('dragon bitter'));
console.log('Halloween masks:', items.map((i, idx) => ({id: idx, name: i.name, color: i.colour})).filter(i => i.name.toLowerCase().includes('mask')));
