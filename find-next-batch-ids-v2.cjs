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

console.log(`Loaded ${npcs.length} NPCs`);

function findNpc(name) {
    npcs.forEach((npc, index) => {
        if (npc.name && npc.name.toLowerCase().includes(name.toLowerCase())) {
            console.log(`NPC: "${npc.name}" (ID: ${index}) - ${npc.description}`);
        }
    });
}

console.log("--- Searching for Spirit ---");
findNpc('Spirit');
console.log("--- Searching for Scorpius ---");
findNpc('Scorpius');
console.log("--- Searching for Shantay ---");
findNpc('Shantay');
