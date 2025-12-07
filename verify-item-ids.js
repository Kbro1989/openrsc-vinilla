/**
 * Item ID Verification Script - Corrected Version
 * In RSC, item IDs are array indices in items.json
 * This script verifies names match between our data and known RSC items
 */

const fs = require('fs');
const path = require('path');

// Load items.json
const itemsPath = path.join(__dirname, 'rsc-data', 'config', 'items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

console.log(`Loaded ${items.length} items from items.json`);

// Known RSC items from OpenRSC and Wiki
const knownRSCItems = {
    0: "Iron Mace",
    1: "Iron Short Sword",
    2: "Iron Kite Shield",
    3: "Iron Square Shield",
    4: "Wooden Shield",
    5: "Medium Iron Helmet",
    6: "Large Iron Helmet",
    7: "Iron Chain Mail Body",
    8: "Iron Plate Mail Body",
    9: "Iron Plate Mail Legs",
    10: "Coins",
    11: "Bronze Arrows",
    12: "Iron Axe",
    13: "Knife",
    14: "Logs",
    31: "Fire-Rune",
    32: "Water-Rune",
    33: "Air-Rune",
    34: "Earth-Rune",
    35: "Mind-Rune",
    36: "Body-Rune",
    37: "Life-Rune",
    38: "Death-Rune",
    40: "Nature-Rune",
    41: "Chaos-Rune",
    42: "Law-Rune",
    46: "Cosmic-Rune"
};

// Verify our items match known RSC items
const mismatches = [];
const matches = [];

for (const [id, expectedName] of Object.entries(knownRSCItems)) {
    const itemId = parseInt(id);
    if (items[itemId]) {
        if (items[itemId].name === expectedName) {
            matches.push({ id: itemId, name: expectedName, status: 'MATCH' });
        } else {
            mismatches.push({
                id: itemId,
                expected: expectedName,
                actual: items[itemId].name,
                status: 'MISMATCH'
            });
        }
    } else {
        mismatches.push({
            id: itemId,
            expected: expectedName,
            actual: null,
            status: 'MISSING'
        });
    }
}

// Create comprehensive item list for reference
const allItems = items.map((item, index) => ({
    id: index,
    name: item.name,
    description: item.description,
    members: item.members || false,
    stackable: item.stackable || false
}));

const output = {
    summary: {
        totalItems: items.length,
        verifiedMatches: matches.length,
        mismatches: mismatches.length
    },
    mismatches,
    matches,
    allItems: allItems.slice(0, 200) // First 200 for reference
};

// Write output
const outputPath = path.join(__dirname, 'item-id-verification.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('\n=== Verification Results ===');
console.log(`Total items: ${output.summary.totalItems}`);
console.log(`Verified matches: ${output.summary.verifiedMatches}`);
console.log(`Mismatches: ${output.summary.mismatches.length}`);

if (mismatches.length > 0) {
    console.log('\nMismatches found:');
    mismatches.forEach(m => {
        console.log(`  ID ${m.id}: Expected "${m.expected}", got "${m.actual || 'MISSING'}"`);
    });
} else {
    console.log('\n✓ All verified items match authentic RSC!');
}

console.log(`\nFull report written to: ${outputPath}`);
