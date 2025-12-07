const fs = require('fs');

const loadJson = (p) => {
    try {
        const content = fs.readFileSync(p, 'utf8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
};

const items = loadJson('./rsc-server/rsc-data-local/config/items.json');
const output = [];

function findItem(name) {
    items.forEach((item, index) => {
        if (item.name && item.name.toLowerCase().includes(name.toLowerCase())) {
            output.push(`Item: "${item.name}" (ID: ${index}) - ${item.description}`);
        }
    });
}

output.push("--- Spirit Items ---");
findItem("Unholy Symbol");
findItem("Unblessed Unholy");
findItem("Mould");
findItem("Crown");

output.push("--- Shantay Items ---");
findItem("Shantay pass");
findItem("Disclaimer");
findItem("Waterskin");
findItem("Desert Shirt");
findItem("Desert Robe");
findItem("Desert Boots");
findItem("Knife");

fs.writeFileSync('item_search_results.txt', output.join('\n'));
console.log("Results written to item_search_results.txt");
