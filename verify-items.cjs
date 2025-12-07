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

const targets = ["Shantay pass", "Shantay Pass", "Crown of the Occult", "Review", "Disclaimer"];
const found = {};

items.forEach((item, index) => {
    targets.forEach(t => {
        if (item.name === t) {
            found[t] = index;
            console.log(`FOUND EXACT: "${t}" -> ${index}`);
        } else if (item.name && item.name.toLowerCase() === t.toLowerCase()) {
            found[t] = index;
            console.log(`FOUND CASE-INSENSITIVE: "${item.name}" -> ${index}`);
        }
    });
});

console.log("Done.");
