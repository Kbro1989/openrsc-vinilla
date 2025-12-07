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

function findNpc(name) {
    npcs.forEach((npc, index) => {
        if (npc.name && npc.name.toLowerCase().includes(name.toLowerCase())) {
            output.push(`NPC: "${npc.name}" (ID: ${index}) - ${npc.description}`);
        }
    });
}

output.push("--- Searching for Spirit ---");
findNpc('Spirit');
output.push("--- Searching for Scorpius ---");
findNpc('Scorpius');
output.push("--- Searching for Shantay ---");
findNpc('Shantay');

fs.writeFileSync('npc_search_results.txt', output.join('\n'));
console.log("Results written to npc_search_results.txt");
