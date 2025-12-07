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

function findNpc(name) {
    npcs.forEach((npc, index) => {
        if (npc.name && npc.name.toLowerCase().includes(name.toLowerCase())) {
            console.log(`NPC: "${npc.name}" -> ${index}`);
        }
    });
}

findNpc('Chemist');
findNpc('Hops');
findNpc('Chancy');
findNpc('Da Vinci'); // OpenRSC spells it Devinci or Da Vinci?
findNpc('Devinci');
findNpc('Guidor');
findNpc('Elena');
