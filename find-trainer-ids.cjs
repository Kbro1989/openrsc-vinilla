const fs = require('fs');
const npcs = JSON.parse(fs.readFileSync('./rsc-server/rsc-data-local/config/npcs.json', 'utf8'));
const targets = ['Bartender', 'Monk', 'Healer', 'Dark', 'Mage', 'Flying'];
const found = [];
npcs.forEach((npc, index) => {
    if (npc.name && targets.some(t => npc.name.includes(t))) {
        found.push(index + ': ' + npc.name + ' (' + npc.description + ')');
    }
});
fs.writeFileSync('trainer_ids.txt', found.join('\n'));
console.log("Done");
