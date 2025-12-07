/**
 * RegionManager - Manages all regions in the game world
 * Based on OpenRSC's RegionManager for efficient spatial queries
 */

const Region = require('./region');

class RegionManager {
    constructor(world) {
        this.world = world;
        this.regions = new Map(); // Key: "x,y" -> Region
    }

    /**
     * Get or create a region at the given coordinates
     */
    getRegion(x, y) {
        const regionX = Math.floor(x / 64);
        const regionY = Math.floor(y / 64);
        const key = `${regionX},${regionY}`;

        if (!this.regions.has(key)) {
            this.regions.set(key, new Region(regionX, regionY));
        }

        return this.regions.get(key);
    }

    /**
     * Get region by world coordinates
     */
    getRegionByWorldCoords(worldX, worldY) {
        return this.getRegion(worldX, worldY);
    }

    /**
     * Get region by region coordinates
     */
    getRegionByRegionCoords(regionX, regionY) {
        const key = `${regionX},${regionY}`;
        return this.regions.get(key);
    }

    /**
     * Add an entity to the appropriate region
     */
    addEntity(type, entity) {
        const region = this.getRegion(entity.x, entity.y);
        region.addEntity(type, entity);

        // Store region reference on entity for quick access
        entity.currentRegion = region;
    }

    /**
     * Remove an entity from its region
     */
    removeEntity(type, entity) {
        if (entity.currentRegion) {
            entity.currentRegion.removeEntity(type, entity);
            entity.currentRegion = null;
        }
    }

    /**
     * Update entity's region if it moved to a new region
     */
    updateEntityRegion(type, entity, oldX, oldY) {
        const oldRegion = this.getRegion(oldX, oldY);
        const newRegion = this.getRegion(entity.x, entity.y);

        // Only update if entity moved to a different region
        if (oldRegion !== newRegion) {
            oldRegion.removeEntity(type, entity);
            newRegion.addEntity(type, entity);
            entity.currentRegion = newRegion;
            return true; // Changed regions
        }

        return false; // Same region
    }

    /**
     * Get all entities within a radius (in regions)
     */
    getEntitiesInRadius(type, centerX, centerY, radiusInRegions = 1) {
        const entities = new Set();
        const centerRegionX = Math.floor(centerX / 64);
        const centerRegionY = Math.floor(centerY / 64);

        for (let dx = -radiusInRegions; dx <= radiusInRegions; dx++) {
            for (let dy = -radiusInRegions; dy <= radiusInRegions; dy++) {
                const region = this.getRegionByRegionCoords(
                    centerRegionX + dx,
                    centerRegionY + dy
                );

                if (region) {
                    const collection = type === 'player' ? region.players :
                        type === 'npc' ? region.npcs :
                            type === 'gameObject' ? region.gameObjects :
                                region.groundItems;

                    collection.forEach(e => entities.add(e));
                }
            }
        }

        return Array.from(entities);
    }

    /**
     * Check if world coordinates are valid
     */
    withinWorld(x, y) {
        // RSC world bounds: 0-944 (approx)
        return x >= 0 && x < 944 && y >= 0 && y < 944;
    }

    /**
     * Clear all regions (for shutdown/reset)
     */
    clear() {
        this.regions.clear();
    }
}

module.exports = RegionManager;
