const items = require('./rsc-server/node_modules/@2003scape/rsc-data/config/items.json');

const potionIds = [
    221, // Attack Potion
    474, // Strength Potion
    477, // Restore Potion
    480, // Prayer Potion
    483, // Super Attack
    486, // Fishing Potion
    489, // Super Strength
    492, // Super Defense
    495, // Ranging Potion
    936  // Zamorak Brew
];

console.log("--- Known Potions ---");
potionIds.forEach(id => {
    const item = items[id];
    console.log(`ID: ${id}, Name: ${item.name}, Desc: ${item.description}`);
    // Check next few IDs for doses
    for (let i = 1; i <= 3; i++) {
        const nextItem = items[id + i];
        if (nextItem) {
            console.log(`  ID: ${id + i}, Name: ${nextItem.name}, Desc: ${nextItem.description}`);
        }
    }
});
