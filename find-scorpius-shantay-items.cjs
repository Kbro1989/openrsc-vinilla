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

function findItem(name) {
    items.forEach((item, index) => {
        if (item.name && item.name.toLowerCase().includes(name.toLowerCase())) {
            console.log(`Item: "${item.name}" -> ${index}`);
        }
    });
}

console.log("--- Spirit Items ---");
findItem("Unholy Symbol");
findItem("Unblessed Unholy");
findItem("Mould");
findItem("Crown");

console.log("--- Shantay Items ---");
findItem("Shantay pass");
findItem("Disclaimer");
findItem("Waterskin");
findItem("Desert Shirt");
findItem("Desert Robe");
findItem("Desert Boots");
findItem("Knife");
