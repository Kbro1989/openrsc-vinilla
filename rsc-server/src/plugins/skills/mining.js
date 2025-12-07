// https://classic.runescape.wiki/w/Mining

const items = require('@2003scape/rsc-data/config/items');
const { rocks, pickaxes } = require('@2003scape/rsc-data/skills/mining');
const { rollSkillSuccess, calcGatheringSuccessfulLegacy } = require('../../rolls');

const ROCK_IDS = new Set(Object.keys(rocks).map(Number));

// Axe bonuses from OpenRSC
const AXE_BONUSES = {
    1262: 0, // Bronze Px
    1261: 1, // Iron Px
    1260: 2, // Steel Px
    1259: 4, // Mithril Px
    1258: 8, // Adamant Px
    1263: 16 // Rune Px
};

// Pickaxe req levels (OpenRSC Formulae.java miningAxeLvls [41, 31, 21, 6, 1, 1])
// 1263: 41 (Rune)
// 1258: 31 (Addy)
// 1259: 21 (Mith)
// 1260: 6  (Steel)
// 1261: 1  (Iron)
// 1262: 1  (Bronze)

// Gem Drops (Formulae.java)
const GEMS = [
    { id: 160, weight: 4 }, // Diamond
    { id: 161, weight: 8 }, // Ruby
    { id: 162, weight: 16 }, // Emerald
    { id: 164, weight: 32 }, // Sapphire
    { id: -1, weight: 63 }   // Nothing (implicit in OpenRSC via weighted choice)
    // Total weight 123 + others from loop keys etc? 
    // OpenRSC gemDropWeights: {63, 32, 16, 8, 4, 2, 2, 1}
    // 63=Nothing, 32=Sapphire, 16=Emerald, 8=Ruby, 4=Diamond, 2=Loop Key, 2=Tooth Key, 1=Nothing Reroll
];

function getGemDrop() {
    const roll = Math.floor(Math.random() * 128);
    let currentWeight = 0;
    // Order: Nothing(63), Sapphire(32), Emerald(16), Ruby(8), Diamond(4), LoopKey(2), ToothKey(2), Reroll(1)
    // Simplified for now:
    // We will use OpenRSC weights directly
    // {id: -1, w: 63}, {id: 164, w: 32}, {id: 162, w: 16}, {id: 161, w: 8}, {id: 160, w: 4}, {id: 390, w: 2}, {id: 391, w: 2}, {id: -1, w: 1}

    // We only want gems usually? Or do rocks drop keys too?
    // Formulae.java calculateGemDrop uses gemDropIDs/weights.
    // Yes it includes keys.
    const drops = [
        { id: -1, weight: 63 },
        { id: 164, weight: 32 },
        { id: 162, weight: 16 },
        { id: 161, weight: 8 },
        { id: 160, weight: 4 },
        { id: 390, weight: 2 }, // Loop key half
        { id: 391, weight: 2 }, // Tooth key half
        { id: -1, weight: 1 }  // Reroll/Nothing
    ];

    for (const drop of drops) {
        if (roll < currentWeight + drop.weight) {
            return drop.id;
        }
        currentWeight += drop.weight;
    }
    return -1;
}

// Ensure PICKAXE_IDS sorts correctly by bonus
const PICKAXE_IDS = Object.keys(AXE_BONUSES).map(Number).sort((a, b) => AXE_BONUSES[b] - AXE_BONUSES[a]);

async function mineRock(player, gameObject) {
    const rockID = gameObject.id;

    if (!ROCK_IDS.has(rockID)) {
        player.message(`@que@Debug: Rock ID ${rockID} not defined in mining skill.`);
        return false;
    }

    const rock = rocks[rockID];
    const miningLevel = player.skills.mining.current;

    if (rock.level > miningLevel) {
        player.message(`You need a mining level of ${rock.level} to mine this rock`);
        return true;
    }

    let bestPickaxeID = -1;
    let axeBonus = 0;

    for (const pickaxeID of PICKAXE_IDS) {
        const reqLevel = pickaxes[pickaxeID].level;
        if (player.inventory.has(pickaxeID) && miningLevel >= reqLevel) {
            bestPickaxeID = pickaxeID;
            axeBonus = AXE_BONUSES[pickaxeID];
            break;
        } else if (player.equipment.has(pickaxeID) && miningLevel >= reqLevel) {
            bestPickaxeID = pickaxeID;
            axeBonus = AXE_BONUSES[pickaxeID];
            break;
        }
    }

    if (bestPickaxeID === -1) {
        player.message("You need a pickaxe to mine this rock");
        player.message("You do not have a pickaxe which you have the mining level to use");
        return true;
    }

    if (player.isTired()) {
        player.message('@que@You are too tired to mine this rock');
        return true;
    }

    const { world } = player;
    const { x, y } = gameObject;

    player.message("@que@You swing your pick at the rock...");
    player.sendBubble(bestPickaxeID);
    player.sendSound('mine');

    await world.sleepTicks(3);

    // Check if rock still there (unless batching handles this)
    if (world.gameObjects.getAtPoint(x, y)[0] !== gameObject) {
        return true;
    }

    // Authentic Success Calculation
    const success = calcGatheringSuccessfulLegacy(rock.level, miningLevel, axeBonus);

    if (success) {
        // Gem Drop Check
        // 1/200 chance normally.
        // If wearing Charged Dragonstone Amulet (ID 522/597?), chance is 1/100 (2/200).
        // ItemId.CHARGED_DRAGONSTONE_AMULET is 597.
        const dragonstoneAmulet = 597;
        const gemChance = player.equipment.has(dragonstoneAmulet) ? 2 : 1;

        if (Math.random() * 200 < gemChance) {
            const gemId = getGemDrop();
            if (gemId !== -1) {
                player.inventory.add(gemId, 1);
                const gemName = items[gemId].name;
                player.message(`@que@You just found a ${gemName}!`);
                player.sendSound('foundgem');
                return true; // Stop mining this rock? Or continue? OpenRSC returns after gem.
            }
        }

        // Deplete rock
        if (rock.empty) {
            const emptyRock = world.replaceEntity(
                'gameObjects',
                gameObject,
                rock.empty
            );

            // Rock respawn time
            // rocks[id].respawn is in ticks? OpenRSC uses seconds.
            // Assuming rsc-data provides ticks.
            // If rsc-data matches OpenRSC data structure, verify units.
            // For now assuming the data file is correct. 
            world.setTimeout(() => {
                world.replaceEntity('gameObjects', emptyRock, rockID);
            }, rock.respawn);
        }

        player.addExperience('mining', rock.experience);
        player.message('@que@You manage to obtain some ore');
        player.inventory.add(rock.ore);

        // Batching handled by engine mostly, but if loop needed:
        // usually we'd loop here or return true to signal action complete.
    } else {
        player.message('@que@You only succeed in scratching the rock');
    }

    return true;
}

async function prospectRock(player, gameObject) {
    const rockID = gameObject.id;

    if (!ROCK_IDS.has(rockID)) {
        player.message(`@que@Debug: Rock ID ${rockID} not defined in mining skill.`);
        return false;
    }

    const rock = rocks[rockID];

    player.message('@que@You examine the rock for ores...');
    await player.world.sleepTicks(2);

    const oreName = items[rock.ore].name.toLowerCase();
    player.message(`@que@This rock contains ${oreName}`);

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (!/mine/i.test(gameObject.definition.commands[0])) {
        return false;
    }

    return await mineRock(player, gameObject);
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (!/prospect/i.test(gameObject.definition.commands[1])) {
        return false;
    }

    return await prospectRock(player, gameObject);
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
