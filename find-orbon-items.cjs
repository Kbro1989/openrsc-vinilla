const fs = require('fs');
const loadJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return []; } };
const items = loadJson('./rsc-server/rsc-data-local/config/items.json');

const targets = ["Protective", "Jacket", "Trousers"];
const found = [];

items.forEach((item, index) => {
    if (item.name) {
        if (item.name.toLowerCase().includes("protective")) {
            found.push(`Item: ${item.name} (${index})`);
        }
    }
});

console.log(found.join('\n'));
