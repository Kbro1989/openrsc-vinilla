const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'rsc-server/node_modules/@2003scape/rsc-data/config/items.json');

try {
    const data = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(data);

    console.log("--- Potion IDs ---");
    items.forEach((item, index) => {
        if (item && (item.name.toLowerCase().includes('potion') || item.name.toLowerCase().includes('brew'))) {
            console.log(`${index}: ${item.name} - ${item.description}`);
        }
    });
} catch (err) {
    console.error("Error reading items.json:", err);
}
