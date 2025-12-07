const fs = require('fs');
const npcs = JSON.parse(fs.readFileSync('./rsc-server/rsc-data-local/config/npcs.json', 'utf8'));
const targets = ['Phoenix', 'Gang', 'Slayer', 'Vannaka', 'Turael', 'Mazchna', 'Drunken', 'Dwarf', 'Genie', 'Evil', 'Chicken', 'Golem', 'Zombie', 'Freaky', 'Forester', 'Master'];
const found = [];
npcs.forEach((npc, index) => {
    if (npc.name && targets.some(t => npc.name.includes(t))) {
        found.push(index + ': ' + npc.name + ' (' + npc.description + ')');
    }
});
fs.writeFileSync('misc_npc_results_2.txt', found.join('\n'));
console.log("Done");
