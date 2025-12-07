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
const items = loadJson('./rsc-server/rsc-data-local/config/items.json');

const mournerIds = [444, 445, 451, 469, 491, 492, 495, 502];

mournerIds.forEach(id => {
    const npc = npcs[id];
    if (npc) {
        console.log(`NPC ${id}: ${npc.name} - "${npc.description}"`);
    } else {
        console.log(`NPC ${id}: NOT FOUND (Index mismatch?)`);
        // If IDs are not indices, this fails. But previous tests suggest indices.
    }
});

function findItem(name) {
    items.forEach((item, index) => {
        if (item.name && item.name.toLowerCase().includes(name.toLowerCase())) {
            console.log(`Item: "${item.name}" -> ${index}`);
        }
    });
}

findItem("Doctor");
findItem("Gown");
