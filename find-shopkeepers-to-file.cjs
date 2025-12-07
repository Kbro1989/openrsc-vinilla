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
const output = [];

const targets = [
    "Alfonse", "Orbon", "Baker", "Fur", "Gem", "Silver", "Spice",
    "Arhein", "Davon", "Gunnjorn", "Shop assistant", "Shop keeper",
    "Flynn", "Harry", "Zeke", "Dommik", "Brian", "Cassie", "Rommik"
];

npcs.forEach((npc, index) => {
    if (npc.name) {
        targets.forEach(t => {
            if (npc.name.toLowerCase().includes(t.toLowerCase())) {
                output.push(`NPC: "${npc.name}" (ID: ${index}) - ${npc.description}`);
            }
        });
    }
});

fs.writeFileSync('shopkeeper_results.txt', output.join('\n'));
console.log("Results written to shopkeeper_results.txt");
