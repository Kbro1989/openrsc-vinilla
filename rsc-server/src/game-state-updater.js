/**
 * GameStateUpdater - OpenRSC-style delta-based state synchronization
 * Only sends entity updates when they change (moved, added, removed)
 */

class GameStateUpdater {
    constructor(world) {
        this.world = world;
    }

    /**
     * Update player's view of other players (delta-based)
     * Based on OpenRSC's GameStateUpdater.updatePlayers()
     */
    updatePlayers(player) {
        const updates = {
            removed: [],
            added: [],
            moved: [],
            spriteChanged: []
        };

        // Remove out-of-range players
        for (const otherPlayer of player.localPlayers) {
            if (!otherPlayer.loggedIn || !this.withinRange(player, otherPlayer, 16)) {
                player.localPlayers.delete(otherPlayer);
                updates.removed.push({
                    index: otherPlayer.index
                });
            } else if (otherPlayer.hasMoved()) {
                // Player moved within range
                updates.moved.push({
                    index: otherPlayer.index,
                    sprite: otherPlayer.direction
                });
            } else if (otherPlayer.spriteChanged()) {
                // Player changed direction without moving
                updates.spriteChanged.push({
                    index: otherPlayer.index,
                    sprite: otherPlayer.direction
                });
            }
        }

        // Add new in-range players (max 255)
        if (player.localPlayers.size < 255) {
            const nearbyPlayers = player.getPlayersInViewRange(16);

            for (const otherPlayer of nearbyPlayers) {
                if (otherPlayer === player) continue;
                if (player.localPlayers.has(otherPlayer)) continue;
                if (player.localPlayers.size >= 255) break;

                player.localPlayers.add(otherPlayer);
                updates.added.push({
                    index: otherPlayer.index,
                    x: otherPlayer.x,
                    y: otherPlayer.y,
                    sprite: otherPlayer.direction,
                    username: otherPlayer.username,
                    combatLevel: otherPlayer.combatLevel,
                    appearance: otherPlayer.getAppearanceUpdate()
                });
            }
        }

        return updates;
    }

    /**
     * Update player's view of NPCs (delta-based)
     * Based on OpenRSC's GameStateUpdater.updateNpcs()
     */
    updateNpcs(player) {
        const updates = {
            removed: [],
            added: [],
            moved: [],
            damaged: []
        };

        // Remove out-of-range NPCs
        for (const npc of player.localNpcs) {
            if (!npc.removed && !this.withinRange(player, npc, 16)) {
                player.localNpcs.delete(npc);
                updates.removed.push({
                    index: npc.index
                });
            } else if (npc.hasMoved && npc.hasMoved()) {
                // NPC moved within range
                updates.moved.push({
                    index: npc.index,
                    sprite: npc.direction || 0
                });
            }
        }

        // Add new in-range NPCs (max 255)
        if (player.localNpcs.size < 255) {
            const nearbyNpcs = player.getNpcsInViewRange(16);

            for (const npc of nearbyNpcs) {
                if (player.localNpcs.has(npc)) continue;
                if (player.localNpcs.size >= 255) break;
                if (npc.removed) continue;

                player.localNpcs.add(npc);
                updates.added.push({
                    index: npc.index,
                    x: npc.x,
                    y: npc.y,
                    sprite: npc.direction || 0,
                    id: npc.id
                });
            }
        }

        return updates;
    }

    /**
     * Update all players in the world (called every tick)
     */
    updateAllPlayers() {
        for (const player of this.world.players) {
            if (!player.loggedIn) continue;

            // Update player's view of other players and NPCs
            const playerUpdates = this.updatePlayers(player);
            const npcUpdates = this.updateNpcs(player);

            // Send delta updates to client
            if (this.hasUpdates(playerUpdates)) {
                player.send({
                    type: 'playerUpdate',
                    ...playerUpdates
                });
            }

            if (this.hasUpdates(npcUpdates)) {
                player.send({
                    type: 'npcUpdate',
                    ...npcUpdates
                });
            }

            // Update flags for next tick
            if (player.updateFlags) {
                player.updateFlags();
            }
        }
    }

    /**
     * Check if update object has any changes
     */
    hasUpdates(updates) {
        return updates.removed.length > 0 ||
            updates.added.length > 0 ||
            updates.moved.length > 0 ||
            (updates.spriteChanged && updates.spriteChanged.length > 0) ||
            (updates.damaged && updates.damaged.length > 0);
    }

    /**
     * Check if two entities are within range
     */
    withinRange(entity1, entity2, range = 16) {
        const deltaX = Math.abs(entity1.x - entity2.x);
        const deltaY = Math.abs(entity1.y - entity2.y);
        return deltaX <= range && deltaY <= range;
    }
}

module.exports = GameStateUpdater;
