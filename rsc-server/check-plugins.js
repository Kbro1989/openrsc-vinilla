const fs = require('fs');
const path = require('path');

const pluginsFile = path.join(__dirname, 'src/plugins/index.js');
const content = fs.readFileSync(pluginsFile, 'utf8');

const regex = /require\('(\.\/[^']+)'\)/g;
let match;

console.log('Checking plugin paths for case sensitivity...');

let errors = 0;

while ((match = regex.exec(content)) !== null) {
    const relPath = match[1];
    const fullPath = path.join(__dirname, 'src/plugins', relPath);
    const dir = path.dirname(fullPath);
    const basename = path.basename(fullPath);

    try {
        const files = fs.readdirSync(dir);
        if (!files.includes(basename)) {
            // Check if it exists case-insensitively
            const lowerFiles = files.map(f => f.toLowerCase());
            const lowerBasename = basename.toLowerCase();
            const index = lowerFiles.indexOf(lowerBasename);

            if (index !== -1) {
                console.error(`❌ Case mismatch: '${relPath}' -> Actual: '${files[index]}'`);
                errors++;
            } else {
                console.error(`❌ File not found: '${relPath}'`);
                errors++;
            }
        }
    } catch (e) {
        console.error(`❌ Directory not found for: '${relPath}' (${dir})`);
        errors++;
    }
}

if (errors === 0) {
    console.log('✅ All plugin paths match filesystem casing!');
} else {
    console.log(`Found ${errors} errors.`);
    process.exit(1);
}
