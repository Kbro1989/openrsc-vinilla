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

findItem("Priest");
findItem("robe");
