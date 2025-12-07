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
console.log('Total items:', items.length);

items.forEach((item, index) => {
    if (item.name && item.name.toLowerCase().includes('plate') && item.name.toLowerCase().includes('body')) {
        console.log(`${index}: ${item.name}`);
    }
    // Also check for "mail top" if that's what Zenesha sells?
    // OpenRSC said "PLATE_MAIL_TOP"
    if (item.name && item.name.toLowerCase().includes('mail') && item.name.toLowerCase().includes('top')) {
        console.log(`${index}: ${item.name} (TOP match)`);
    }
});
