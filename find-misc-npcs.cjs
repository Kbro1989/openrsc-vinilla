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

const targets = [
    'Weapon Master',
    'Lathas',
    'Paladin',
    'Hero',
    'Guide',
    'Forester',
    'Jekyl',
    'Hyde',
    'Romeo',
    'Juliet',
    'Apothecary',
    'Father', // Father Lawrence, Father Aereck
    'Fortunii', // Dramen staff guy
    'Sanfew',
    'Kaqemeex',
    'Turael',
    'Mazchna',
    'Vannaka'
];

targets.forEach(t => {
    output.push(`--- Searching for ${t} ---`);
    findNpc(t);
});

fs.writeFileSync('misc_npc_results.txt', output.join('\n'));
console.log("Results written to misc_npc_results.txt");
