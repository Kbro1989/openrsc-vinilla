const fs = require('fs');
const path = require('path');

try {
    const itemsPath = path.join(__dirname, 'rsc-data', 'config', 'items.json');
    console.log(`Reading items from: ${itemsPath}`);
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

    const potions = [];
    items.forEach((item, index) => {
        if (item.name && (item.name.toLowerCase().includes('potion') || item.name.toLowerCase().includes('antipoison') || item.name.toLowerCase().includes('poison'))) {
            potions.push({ id: index, name: item.name, description: item.description });
        }
    });

    console.log(JSON.stringify(potions, null, 2));
} catch (err) {
    console.error("Error:", err);
}
