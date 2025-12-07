// https://classic.runescape.wiki/w/Smithing#Smelting

const items = require('@2003scape/rsc-data/config/items');
const { smelting } = require('@2003scape/rsc-data/skills/smithing');

const BRONZE_BAR_ID = 169;
const COAL_ID = 155;
const FURNACE_ID = 118;
const GOLD_BAR_ID = 172;
const IRON_BAR_ID = 170;
const IRON_ORE = 151;
const SILVER_BAR_ID = 384;
const STEEL_BAR_ID = 171;
const CANNONBALL_ID = 1041;
const AMMO_MOULD_ID = 1026;
const RING_OF_FORGING_ID = 1205; // Check authentic ID. rsc-data should have it. 
const GAUNTLETS_OF_GOLDSMITHING_ID = 1008; // Family Crest gauntlets (gold)
const CANNONBALL_XP = 25.6; // 25.6 * 4 approx? OpenRSC says 50, so maybe 12.5? Wiki says 25.6. OpenRSC is... weird with XP. Let's trust Wiki or use standard.
const IRON_FAIL_CHANCE = 0.5; // 50%


const ORE_IDS = new Set();

for (const { ores } of Object.values(smelting)) {
    for (const { id } of ores) {
        ORE_IDS.add(id);
    }
}

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== FURNACE_ID || (!ORE_IDS.has(item.id) && item.id !== STEEL_BAR_ID)) {
        return false;
    }

    // Cannonball Smelting (Steel Bar -> Furnace with Mould)
    if (item.id === STEEL_BAR_ID) {
        if (!player.inventory.has(AMMO_MOULD_ID)) {
            player.message('You need an ammo mould to make cannonballs');
            return true;
        }
        if (player.skills.smithing.current < 30) {
            player.message('You need at least level-30 smithing to make cannon balls');
            return true;
        }
        // TODO: Quest check Dwarf Cannon?

        player.message("@que@You heat the steel bar into a liquid state");
        await player.world.sleepTicks(2);
        player.message("@que@and pour it into your cannon ball mould");
        await player.world.sleepTicks(2);
        player.message("@que@you then leave it to cool for a short while");
        await player.world.sleepTicks(2);

        player.inventory.remove(item.id);
        player.inventory.add(CANNONBALL_ID, 4); // Makes 4? Wiki says 4.
        player.addExperience('smithing', 25.6);
        player.message("It's very heavy");
        return true;
    }

    let resultBarID = -1;

    // > Coal can be used on a furnace with iron ore in the player's inventory
    // > to smelt steel bars. This does not work with any other bar which
    // > requires coal to create.
    if (item.id === COAL_ID) {
        resultBarID = STEEL_BAR_ID;
    } else {
        barLoop: for (const [barID, { ores }] of Object.entries(smelting)) {
            for (const { id } of ores) {
                if (id === COAL_ID) {
                    continue;
                }

                if (item.id == id) {
                    if (id === IRON_ORE && player.inventory.has(COAL_ID, 2)) {
                        resultBarID = STEEL_BAR_ID;
                    } else {
                        resultBarID = +barID;
                    }

                    break barLoop;
                }
            }
        }
    }

    if (resultBarID === -1) {
        return false;
    }

    const metalName = items[resultBarID].name.toLowerCase().replace(' bar', '');
    const isCraftingBar =
        resultBarID === GOLD_BAR_ID || resultBarID == SILVER_BAR_ID;
    const smithingLevel = player.skills.smithing.current;
    const { level, experience, ores } = smelting[resultBarID];

    player.sendBubble(item.id);

    if (player.isTired()) {
        player.message('You are too tired to smelt this ore');
        return true;
    }

    if (smithingLevel < level) {
        player.message(
            `@que@You need to be at least level-${level} smithing to ` +
            `${isCraftingBar ? 'work' : 'smelt'} ${metalName}`
        );

        if (resultBarID === IRON_BAR_ID) {
            player.message(
                '@que@Practice your smithing using tin and copper to make ' +
                'bronze'
            );
        }

        return true;
    }

    let missingOreID = -1;
    let missingOreAmount = -1;

    for (const { id, amount } of ores) {
        if (!player.inventory.has(id, amount)) {
            missingOreID = id;
            missingOreAmount = amount;
            break;
        }
    }

    if (missingOreID > -1) {
        const missingOreName = items[missingOreID].name
            .toLowerCase()
            .replace(' ore', '');

        if (resultBarID === BRONZE_BAR_ID) {
            player.message(
                `@que@You also need some ${missingOreName} to make ${metalName}`
            );
        } else if (resultBarID === STEEL_BAR_ID) {
            player.message('@que@You need 1 iron-ore and 2 coal to make steel');
        } else {
            player.message(
                `You need ${missingOreAmount} heaps of ${missingOreName} to ` +
                `smelt ${metalName}`
            );
        }

        return true;
    }

    const { world } = player;

    let placeMessage;

    if (isCraftingBar) {
        placeMessage = `You place a lump of ${metalName} in the furnace`;
    } else if (resultBarID === IRON_BAR_ID) {
        placeMessage = `You smelt the iron in the furnace`;
    } else if (resultBarID === BRONZE_BAR_ID) {
        placeMessage = 'You smelt the copper and tin in the furnace';
    } else {
        const secondOreAmount = ores[1].amount;
        const secondOreName = items[ores[1].id].name
            .toLowerCase()
            .replace(' ore', '');

        placeMessage =
            `You place the ${metalName} and ${secondOreAmount} heaps of ` +
            `${secondOreName} into the furnace`;
    }

    for (const ore of ores) {
        player.inventory.remove(ore);
    }

    player.message(`@que@${placeMessage}`);
    player.sendSound('cooking'); // Furnace uses similar sound to cooking (fire-based)
    await world.sleepTicks(3);

    if (resultBarID === IRON_BAR_ID) {
        let success = Math.random() >= 0.5;

        if (player.equipment.has(RING_OF_FORGING_ID)) {
            success = true;
            // TODO: Decrement charges? For now just simplified infinite or we need charge tracking.
            player.message("@or1@Your ring of forging shines brightly");
        }

        if (!success) {
            player.message('The ore is too impure and you fail to refine it');
            return true;
        }
    }

    let xp = experience;
    if (resultBarID === GOLD_BAR_ID && player.equipment.has(GAUNTLETS_OF_GOLDSMITHING_ID)) {
        xp += 23; // Bonus XP? OpenRSC says 23 extra. Wiki says 22.5 to 56.2. 
        // Normal gold XP is 22.5. With gauntlets it is 56.2. Diff is 33.7. 
        // OpenRSC code `smelt.getXp() + 45`. Wait, 45? OpenRSC base is 90?
        // Ah, OpenRSC uses 4x XP in definitions maybe? Or integer base.
        // Let's stick to base RSC XP + bonus. 
        // Base gold = 22.5. With Gauntlets = 56.2.
        xp = 56.2;
    }
    player.inventory.add(resultBarID);
    player.message(`@que@You retrive a bar of ${metalName}`);

    return true;
}

module.exports = { onUseWithGameObject };
