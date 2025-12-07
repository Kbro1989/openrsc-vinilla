const fs = require('fs');

const loadJson = (p) => {
    try {
        const content = fs.readFileSync(p, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
};

const npcs = loadJson('./rsc-server/rsc-data-local/config/npcs.json');

const targets = [
    "Alfonse", "Orbon", "Baker", "Fur", "Gem", "Silver", "Spice",
    "Arhein", "Davon", "Harry", "Gunnjorn", "General store", "Shop assistant", "Shop keeper",
    "Flynn", "Zeke", "Dommik", "Brian", "Cassie", "Rommik" // Known shopkeepers to check
];

const found = [];

npcs.forEach((npc, index) => {
    if (npc.name) {
        targets.forEach(t => {
            if (npc.name.toLowerCase().includes(t.toLowerCase())) {
                found.push(`NPC: "${npc.name}" (ID: ${index}) - ${npc.description}`);
            }
        });
    }
});

fs.writeFileSync('shopkeeper_ids.txt', found.join('\n'));
console.log("Done.");
