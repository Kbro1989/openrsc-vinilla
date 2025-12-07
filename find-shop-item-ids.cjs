const fs = require('fs');
const loadJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return []; } };
const items = loadJson('./rsc-server/rsc-data-local/config/items.json');

const targets = [
    "Herring", "Cod", "Tuna", "Lobster", "Swordfish",
    "Bread", "Cake", "Chocolate slice",
    "Fur", "Grey wolf fur",
    "Sapphire", "Emerald", "Ruby",
    "Unstrung holy symbol", "Silver", "Silver bar",
    "Spice",
    "Net", "Fishing rod", "Harpoon", "Lobster pot", "Fishing bait", "Big fishing net" // Check "Net" vs "Small fishing net"
];

const found = {};
items.forEach((item, index) => {
    targets.forEach(t => {
        if (item.name && item.name.toLowerCase() === t.toLowerCase()) {
            found[t] = index;
        } else if (item.name && item.name.toLowerCase().includes(t.toLowerCase()) && !found[t]) {
            // Partial match fallback
            found[t + " (partial)"] = item.name + " (" + index + ")";
        }
    });
});
console.log(found);
