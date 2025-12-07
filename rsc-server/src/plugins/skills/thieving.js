const items = require('@2003scape/rsc-data/config/items');
const thieving = require('@2003scape/rsc-data/skills/thieving');
const { rollSkillSuccess } = require('../../rolls');

const PICKPOCKET_NPCS = thieving.pickpocket;
const PICKPOCKET_NPC_IDS = new Set(Object.keys(PICKPOCKET_NPCS).map(Number));

const STALLS = thieving.stalls;
const STALL_IDS = new Set(Object.keys(STALLS).map(Number));

const CHESTS = thieving.chests;
const CHEST_IDS = new Set(Object.keys(CHESTS).map(Number));

const DOORS = thieving.doors;
const DOOR_IDS = new Set(Object.keys(DOORS).map(Number));

// === NPC Pickpocket ===
async function onNPCCommand(player, npc, command) {
    console.log(`Thieving: onNPCCommand cmd=${command} npc=${npc.id}`);

    if (command !== 'pickpocket') {
        return false;
    }

    if (!PICKPOCKET_NPC_IDS.has(npc.id)) {
        player.message(`@que@Debug: NPC ID ${npc.id} not defined in thieving.`);
        return false;
    }

    try {
        await pickpocketNPC(player, npc);
    } catch (err) {
        console.error('Pickpocket error:', err);
        player.message(`@que@Debug: Pickpocket error: ${err.message}`);
    }

    return true;
}

async function pickpocketNPC(player, npc) {
    const def = PICKPOCKET_NPCS[npc.id];
    const thievingLevel = player.skills.thieving.current;

    if (def.level > thievingLevel) {
        player.message(
            `@que@You need a thieving level of ${def.level} to pickpocket this NPC`
        );
        return;
    }

    if (npc.inCombat()) {
        player.message('I can\'t get close enough');
        return;
    }

    player.message(`@que@You attempt to pick the ${npc.definition.name}'s pocket`);
    await player.world.sleepTicks(2);

    const success = rollSkillSuccess(def.roll[0], def.roll[1], thievingLevel);

    if (success) {
        player.addExperience('thieving', def.experience);

        if (def.items && def.items.length > 0) {
            const lootItem = def.items[0];
            player.inventory.add(lootItem.id, lootItem.amount || 1);
            player.message('@que@You successfully pick the pocket');
        }
    } else {
        player.message(`@que@You fail to pick the ${npc.definition.name}'s pocket`);
        if (def.exclaimation) {
            player.chat(def.exclaimation, npc);
        }
        player.damage(def.stunDamage || 1);
        player.sendSound('combat1b');

        // Authentic: NPC attacks player on fail
        if (npc.isAttackable()) {
            npc.startCombat(player);
        }
    }
}

// === Stalls & Chests (Game Objects) ===
async function onGameObjectCommandOne(player, gameObject) {
    const id = gameObject.id;

    // Check if it's a stall
    if (STALL_IDS.has(id)) {
        return await stealFromStall(player, gameObject);
    }

    // Check if it's a chest
    if (CHEST_IDS.has(id)) {
        return await stealFromChest(player, gameObject);
    }

    return false;
}

async function stealFromStall(player, gameObject) {
    const def = STALLS[gameObject.id];
    const thievingLevel = player.skills.thieving.current;

    if (def.level > thievingLevel) {
        player.message(
            `@que@You need a thieving level of ${def.level} to steal from this stall`
        );
        return;
    }

    // Authentic Guard Detection
    if (def.guards && def.guards.length > 0) {
        const nearbyNPCs = player.localEntities.known.npcs;
        for (const npc of nearbyNPCs) {
            if (def.guards.includes(npc.id) && npc.u === player.u && player.withinRange(npc, 5)) {
                // Check verification (Line of Sight would be ideal, but simple range is okay for now)
                // In OpenRSC, they check if "canBeSeen".
                player.chat('Hey! Get your hands off there!', npc);
                npc.startCombat(player);
                return;
            }
        }
    }
    // Also check for Shop Owner/Owner
    if (def.owner) {
        const nearbyNPCs = player.localEntities.known.npcs;
        for (const npc of nearbyNPCs) {
            if (npc.id === def.owner && player.withinRange(npc, 8)) {
                player.chat('Hey that\'s mine!', npc);
                // Owner doesn't always attack, but blocks theft
                return;
            }
        }
    }

    player.message('@que@You attempt to steal from the stall');
    await player.world.sleepTicks(2);

    const success = rollSkillSuccess(def.roll[0], def.roll[1], thievingLevel);

    if (success) {
        player.addExperience('thieving', def.experience);

        if (def.items && def.items.length > 0) {
            // Weighted loot selection
            const totalWeight = def.items.reduce((sum, item) => sum + (item.weight || 1), 0);
            let random = Math.random() * totalWeight;

            for (const item of def.items) {
                random -= (item.weight || 1);
                if (random <= 0) {
                    player.inventory.add(item.id, item.amount || 1);
                    player.message('@que@You successfully steal from the stall');
                    break;
                }
            }
        }
    } else {
        player.message('@que@You fail to steal from the stall');
        player.damage(def.stunDamage || 1);

        // Alert nearby guards on fail?
        if (def.guards && def.guards.length > 0) {
            const nearbyNPCs = player.localEntities.known.npcs;
            for (const npc of nearbyNPCs) {
                if (def.guards.includes(npc.id) && player.withinRange(npc, 5)) {
                    player.chat('Hey! Get your hands off there!', npc);
                    npc.startCombat(player);
                    break;
                }
            }
        }
    }
}

async function stealFromChest(player, gameObject) {
    const def = CHESTS[gameObject.id];
    const thievingLevel = player.skills.thieving.current;

    if (def.level > thievingLevel) {
        player.message(
            `@que@You need a thieving level of ${def.level} to open this chest`
        );
        return;
    }

    player.message('@que@You search the chest for traps');
    await player.world.sleepTicks(2);

    player.message('@que@You find a trap on the chest');
    await player.world.sleepTicks(2);

    player.message('@que@You disable the trap');
    await player.world.sleepTicks(2);

    player.message('@que@You open the chest');
    await player.world.sleepTicks(2);

    const success = rollSkillSuccess(def.roll[0], def.roll[1], thievingLevel);

    if (success) {
        player.addExperience('thieving', def.experience);

        if (def.items && def.items.length > 0) {
            const lootItem = def.items[0];
            player.inventory.add(lootItem.id, lootItem.amount || 1);
            player.message('@que@You find treasure inside!');
        }

        if (def.teleport) {
            player.message('Suddenly a second magical trap triggers');
            await player.world.sleepTicks(2);
            player.teleport(def.teleport.x, def.teleport.y);
        }

    } else {
        player.message('@que@You fail to open the chest');
        player.damage(def.stunDamage || 1);
    }
}

// === Doors (Wall Objects) ===
async function onWallObjectCommandOne(player, wallObject) {
    const id = wallObject.id;

    if (!DOOR_IDS.has(id)) {
        return false;
    }

    return await pickLockDoor(player, wallObject);
}

async function pickLockDoor(player, wallObject) {
    const def = DOORS[wallObject.id];
    const thievingLevel = player.skills.thieving.current;

    if (def.level > thievingLevel) {
        player.message(
            `@que@You need a thieving level of ${def.level} to pick this lock`
        );
        return;
    }

    player.message('@que@You attempt to pick the lock');
    await player.world.sleepTicks(3);

    const success = rollSkillSuccess(def.roll[0], def.roll[1], thievingLevel);

    if (success) {
        player.addExperience('thieving', def.experience);
        player.message('@que@You successfully pick the lock');
        // TODO: Open the door or teleport player
    } else {
        player.message('@que@You fail to pick the lock');
        player.damage(def.stunDamage || 1);
    }
}

module.exports = {
    onNPCCommand,
    onGameObjectCommandOne,
    onWallObjectCommandOne
};
