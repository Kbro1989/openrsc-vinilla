/**
 * Player update helper functions for OpenRSC-style delta synchronization
 * These can be added to Player class as methods
 */

/** Check if player moved this tick (OpenRSC pattern) */
function hasMoved() {
    return this.x !== this.lastX || this.y !== this.lastY;
}

/** Check if player's sprite/direction changed */
function spriteChanged() {
    return this.direction !== this.lastSprite;
}

/** Update last position/sprite after processing (call at end of tick) */
function updateFlags() {
    this.lastX = this.x;
    this.lastY = this.y;
    this.lastSprite = this.direction;
}

/** Get players within view range (uses regions when available) */
function getPlayersInViewRange(range = 16) {
    if (this.currentRegion && this.world.regionManager) {
        return this.currentRegion.getPlayersInView(this.world.regionManager)
            .filter(p => this.withinRange(p, range));
    }
    return this.getNearbyEntities('players', range);
}

/** Get NPCs within view range (uses regions when available) */
function getNpcsInViewRange(range = 16) {
    if (this.currentRegion && this.world.regionManager) {
        return this.currentRegion.getNpcsInView(this.world.regionManager)
            .filter(n => this.withinRange(n, range));
    }
    return this.getNearbyEntities('npcs', range);
}

/** Update heartbeat activity (prevents timeout) */
function updateActivity() {
    this.lastClientActivity = Date.now();
}

/** Check if player is within authentic range (16 tiles) */
function withinRange(other, range = 16) {
    const deltaX = Math.abs(this.x - other.x);
    const deltaY = Math.abs(this.y - other.y);
    return deltaX <= range && deltaY <= range;
}

module.exports = {
    hasMoved,
    spriteChanged,
    updateFlags,
    getPlayersInViewRange,
    getNpcsInViewRange,
    updateActivity,
    withinRange
};
