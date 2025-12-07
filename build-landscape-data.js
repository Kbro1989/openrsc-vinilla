/**
 * Landscape Data Pre-processor for Cloudflare
 * Converts .jag files to embedded JSON to avoid file system dependencies
 */

const fs = require('fs');
const path = require('path');
const { Landscape } = require('@2003scape/rsc-landscape');

async function serializeLandscape() {
    console.log('Loading landscape data...');

    const landscape = new Landscape();

    // Load .jag files
    const landPath = path.join(
        __dirname,
        'node_modules/@2003scape/rsc-data/landscape/land63.jag'
    );
    const mapsPath = path.join(
        __dirname,
        'node_modules/@2003scape/rsc-data/landscape/maps63.jag'
    );

    landscape.loadJag(
        fs.readFileSync(landPath),
        fs.readFileSync(mapsPath)
    );

    // Parse archives
    landscape.parseArchives();

    console.log('Serializing landscape data...');

    // Extract tile data
    const tiles = [];
    const sectors = landscape.sectors;

    for (let plane = 0; plane < 4; plane++) {
        for (let x = 0; x < 2304; x++) {
            for (let y = 0; y < 1776; y++) {
                try {
                    const tile = landscape.getTile(x, y, plane);
                    if (tile) {
                        tiles.push({
                            x,
                            y,
                            plane,
                            groundElevation: tile.groundElevation,
                            groundTexture: tile.groundTexture,
                            groundOverlay: tile.groundOverlay,
                            roofTexture: tile.roofTexture,
                            horizontalWall: tile.wall?.horizontal,
                            verticalWall: tile.wall?.vertical,
                            diagonalWalls: tile.wall?.diagonal
                        });
                    }
                } catch (e) {
                    // Tile doesn't exist, skip
                }
            }
        }
    }

    console.log(`Serialized ${tiles.length} tiles`);

    // Create output
    const output = {
        tiles,
        metadata: {
            planeWidth: 2304,
            planeHeight: 1776,
            planeCount: 4,
            generatedAt: new Date().toISOString()
        }
    };

    // Write to file
    const outputPath = path.join(__dirname, 'rsc-server/src/landscape-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(output));

    console.log(`Landscape data written to ${outputPath}`);
    console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

// Also load members data if needed
async function serializeMembersLandscape() {
    console.log('Loading members landscape data...');

    const landscape = new Landscape();

    const landPath = path.join(
        __dirname,
        'node_modules/@2003scape/rsc-data/landscape/land63.jag'
    );
    const mapsPath = path.join(
        __dirname,
        'node_modules/@2003scape/rsc-data/landscape/maps63.jag'
    );
    const landMemPath = path.join(
        __dirname,
        'node_modules/@2003scape/rsc-data/landscape/land63.mem'
    );
    const mapsMemPath = path.join(
        __dirname,
        'node_modules/@2003scape/rsc-data/landscape/maps63.mem'
    );

    landscape.loadJag(
        fs.readFileSync(landPath),
        fs.readFileSync(mapsPath)
    );

    landscape.loadMem(
        fs.readFileSync(landMemPath),
        fs.readFileSync(mapsMemPath)
    );

    landscape.parseArchives();

    console.log('Serializing members landscape data...');

    // Same serialization as above
    const tiles = [];

    for (let plane = 0; plane < 4; plane++) {
        for (let x = 0; x < 2304; x++) {
            for (let y = 0; y < 1776; y++) {
                try {
                    const tile = landscape.getTile(x, y, plane);
                    if (tile) {
                        tiles.push({
                            x,
                            y,
                            plane,
                            groundElevation: tile.groundElevation,
                            groundTexture: tile.groundTexture,
                            groundOverlay: tile.groundOverlay,
                            roofTexture: tile.roofTexture,
                            horizontalWall: tile.wall?.horizontal,
                            verticalWall: tile.wall?.vertical,
                            diagonalWalls: tile.wall?.diagonal
                        });
                    }
                } catch (e) {
                    // Tile doesn't exist, skip
                }
            }
        }
    }

    console.log(`Serialized ${tiles.length} tiles (members)`);

    const output = {
        tiles,
        metadata: {
            planeWidth: 2304,
            planeHeight: 1776,
            planeCount: 4,
            members: true,
            generatedAt: new Date().toISOString()
        }
    };

    const outputPath = path.join(__dirname, 'rsc-server/src/landscape-data-members.json');
    fs.writeFileSync(outputPath, JSON.stringify(output));

    console.log(`Members landscape data written to ${outputPath}`);
    console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

// Run serialization
serializeLandscape()
    .then(() => {
        console.log('\n✅ Free-to-play landscape serialization complete!');
        return serializeMembersLandscape();
    })
    .then(() => {
        console.log('\n✅ Members landscape serialization complete!');
        console.log('\n🎉 All landscape data ready for Cloudflare deployment!');
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
