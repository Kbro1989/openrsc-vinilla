/**
 * Region - Represents a 64x64 tile area of the game world
 * Based on OpenRSC's Region system for spatial partitioning
 */

class Region {
    constructor(regionX, regionY) {
        this.regionX = regionX; // Region coordinate (worldX / 64)
        this.regionY = regionY; // Region coordinate (worldY / 64)

        // Entity collections
        this.players = new Set();
        this.npcs = new Set();
        this.gameObjects = new Set();
        this.groundItems = new Set();

        // Region bounds
        this.minX = regionX * 64;
        this.maxX = (regionX + 1) * 64 - 1;
        this.minY = regionY * 64;
        this.maxY = (regionY + 1) * 64 - 1;
    }

    /**
     * Add an entity to this region
     */
    addEntity(type, entity) {
        switch (type) {
            case 'player':
                this.players.add(entity);
                break;
            case 'npc':
                this.npcs.add(entity);
                break;
            case 'gameObject':
                this.gameObjects.add(entity);
                break;
            case 'groundItem':
                this.groundItems.add(entity);
                break;
        }
    }

    /**
     * Remove an entity from this region
     */
    removeEntity(type, entity) {
        switch (type) {
            case 'player':
                this.players.delete(entity);
                break;
            case 'npc':
                this.npcs.delete(entity);
                break;
            case 'gameObject':
                this.gameObjects.delete(entity);
                break;
            case 'groundItem':
                this.groundItems.delete(entity);
                break;
        }
    }

    /**
     * Check if coordinates are within this region
     */
    contains(x, y) {
        return x >= this.minX && x <= this.maxX &&
            y >= this.minY && y <= this.maxY;
    }

    /**
     * Get all players in this region and adjacent regions (for view area)
     */
    getPlayersInView(regionManager) {
        const players = new Set(this.players);

        // Add players from 8 surrounding regions
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                const neighbor = regionManager.getRegion(
                    this.regionX + dx,
                    this.regionY + dy
                );

                if (neighbor) {
                    neighbor.players.forEach(p => players.add(p));
                }
            }
        }

        return Array.from(players);
    }

    /**
     * Get all NPCs in this region and adjacent regions
     */
    getNpcsInView(regionManager) {
        const npcs = new Set(this.npcs);

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;

                const neighbor = regionManager.getRegion(
                    this.regionX + dx,
                    this.regionY + dy
                );

                if (neighbor) {
                    neighbor.npcs.forEach(n => npcs.add(n));
                }
            }
        }

        return Array.from(npcs);
    }
}

module.exports = Region;
