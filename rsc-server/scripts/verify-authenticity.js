const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const files = [
    '../rsc-data-local/config/items.json',
    '../rsc-data-local/config/npcs.json',
    '../rsc-data-local/config/objects.json'
];

console.log('Verifying Data Authenticity (MD5)...');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5').update(content).digest('hex');
        console.log(`${path.basename(file)}: ${hash}`);
    } else {
        console.error(`${path.basename(file)}: MISSING`);
    }
});
