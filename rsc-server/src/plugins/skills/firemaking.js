// https://classic.runescape.wiki/w/Firemaking

// https://oldschool.runescape.wiki/w/Fire#cite_note-1
// > Mod Ash: "[How long do fires last roughly (or precisely if you wish to be
// > so kind)?] 60-119 secs randomly."

const GameObject = require('../../model/game-object');
const GroundItem = require('../../model/ground-item');
const { rollSkillSuccess, calcProductionSuccessfulLegacy } = require('../../rolls');

const ASHES_ID = 181;
const FIRE_ID = 97;
const TINDERBOX_ID = 166;
const { logs } = require('@2003scape/rsc-data/skills/firemaking');

// 25% at level 1, 100% at level 60
const ROLL = [64, 392];

async function onUseWithGroundItem(player, item, groundItem) {
    // Check if item is a valid log
    if (item.id !== TINDERBOX_ID || !logs[groundItem.id]) {
        return false;
    }

    const { world } = player;
    const { x, y } = groundItem;

    const indoors = !!world.landscape.getTileAtGameCoords(x, y).getTileDef().indoors;

    if (indoors || world.gameObjects.getAtPoint(x, y).length) {
        player.message("@que@You can't light a fire here");
        return true;
    }

    const logDef = logs[groundItem.id];
    const level = player.skills.firemaking.current;

    if (level < logDef.level) {
        player.message(`@que@You need a firemaking level of ${logDef.level} to light these logs`);
        return true;
    }

    player.sendBubble(TINDERBOX_ID);
    player.message('@que@You attempt to light the logs');
    await world.sleepTicks(2);

    // Authentic Success: OpenRSC uses specific formulas but calcProductionSuccessfulLegacy 
    // with req=1 (for normal) and cap=60 works well. 
    // We scale the cap slightly for harder logs to ensure higher levels help.
    const fireSuccess = calcProductionSuccessfulLegacy(logDef.level, level, true, logDef.level + 40);

    if (fireSuccess) {
        player.message('@que@The fire catches and the logs begin to burn');
        world.removeEntity('groundItems', groundItem);

        const fire = new GameObject(world, {
            id: FIRE_ID,
            x,
            y,
            direction: 0
        });

        // Fire duration ~60-120s
        world.setTimeout(() => {
            world.removeEntity('gameObjects', fire);
            const ashes = new GroundItem(world, { id: ASHES_ID, x, y });
            world.addEntity('groundItems', ashes);
        }, (Math.floor(Math.random() * 60) + 60) * 1000);

        world.addEntity('gameObjects', fire);

        // Authentic XP
        player.addExperience('firemaking', logDef.experience);

        // Authentic Walk-Back (West preferred, else any adjacent)
        // In RSC you always move OFF the fire.
        // Try West (x-1)
        player.walk(player.x - 1, player.y);

    } else {
        player.message('@que@You fail to light a fire');
    }

    return true;
}

async function onUseWithInventory(player, item, targetItem) {
    if (
        !(logs[item.id] && targetItem.id === TINDERBOX_ID) &&
        !(item.id === TINDERBOX_ID && logs[targetItem.id])
    ) {
        return false;
    }

    // who's talking to the player??
    player.message(
        '@que@I think you should put the logs down before you light them!'
    );

    return true;
}

module.exports = { onUseWithGroundItem, onUseWithInventory };
