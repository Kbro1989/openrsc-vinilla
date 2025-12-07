const fs = require('fs');
const path = require('path');

const pluginsFile = path.join(__dirname, 'src/plugins/index.js');
const content = fs.readFileSync(pluginsFile, 'utf8');

console.log('Instrumenting plugins/index.js...');

const lines = content.split('\n');
const newLines = [];

newLines.push('const logPlugin = (name) => console.log(`Loading plugin: ${name}`);');
newLines.push('module.exports = {');

const regex = /"([^"]+)": require\('([^']+)'\),?/;

for (const line of lines) {
    const match = regex.exec(line);
    if (match) {
        const key = match[1];
        const reqPath = match[2];
        // We can't easily do try-catch inside the object literal, so we'll use an IIFE
        const replacement = `    "${key}": (() => { logPlugin("${key}"); try { return require('${reqPath}'); } catch (e) { console.error("FAILED TO LOAD PLUGIN: ${key}", e); process.exit(1); } })(),`;
        newLines.push(replacement);
    } else if (line.trim() === '};' || line.trim() === 'module.exports = {' || line.trim() === '') {
        if (line.trim() === '};') newLines.push(line);
    } else {
        // Keep comments etc, but ignore the original module.exports start
        if (!line.includes('module.exports')) {
            newLines.push(line);
        }
    }
}

fs.writeFileSync(pluginsFile, newLines.join('\n'));
console.log('Done!');
