// https://classic.runescape.wiki/w/Cooking

// using items on ranges or fires

const { rollSkillSuccess, calcProductionSuccessfulLegacy } = require('../../../rolls');
const { uncooked } = require('@2003scape/rsc-data/skills/cooking');

const GAUNTLETS_OF_COOKING_ID = 701;
const RAW_SWORDFISH_ID = 369;
const RAW_LOBSTER_ID = 372;
const RAW_SHARK_ID = 545;
const RAW_OOMLIE_MEAT_ID = 1019;
const SEAWEED_ID = 622;
const SODA_ASH_ID = 624;
const UNCOOKED_SWAMP_PASTE_ID = 1100;
const SWAMP_PASTE_ID = 1099;
const BURNT_MEAT_ID = 134;

const CAKE_TIN_ID = 338;
const COOKS_RANGE_ID = 119;
const FIRE_IDS = new Set([97, 274]);
const RANGE_IDS = new Set([11, 491]);

const COOKS_RANGE_BONUS = 1.05;
const FIRE_PENALTY = 0.95;

function getDefinition(id) {
    const definition = uncooked[id];

    if (definition && definition.reference) {
        return getDefinition(definition.reference);
    }

    return definition;
}

function isMeat(item) {
    return item.definition.sprite === 60;
}

async function onUseWithGameObject(player, gameObject, item) {
    // Special Cases handling
    if (item.id === SEAWEED_ID) {
        if (!FIRE_IDS.has(gameObject.id) && !RANGE_IDS.has(gameObject.id) && gameObject.id !== COOKS_RANGE_ID) return false;
        player.message("You put the seaweed on the " + (FIRE_IDS.has(gameObject.id) ? "fire" : "stove"));
        await player.world.sleepTicks(3);
        player.inventory.remove(item.id);
        player.inventory.add(SODA_ASH_ID);
        player.message("The seaweed burns to ashes");
        return true;
    }

    if (item.id === UNCOOKED_SWAMP_PASTE_ID) {
        if (!FIRE_IDS.has(gameObject.id) && !RANGE_IDS.has(gameObject.id) && gameObject.id !== COOKS_RANGE_ID) return false;
        player.message("you warm the paste over the fire");
        await player.world.sleepTicks(3);
        player.inventory.remove(item.id);
        player.inventory.add(SWAMP_PASTE_ID);
        player.message("it thickens into a sticky goo");
        return true;
    }

    if (item.id === RAW_OOMLIE_MEAT_ID) {
        if (!FIRE_IDS.has(gameObject.id) && !RANGE_IDS.has(gameObject.id) && gameObject.id !== COOKS_RANGE_ID) return false;
        player.message("You cook the meat on the " + (FIRE_IDS.has(gameObject.id) ? "fire" : "stove") + "...");
        await player.world.sleepTicks(3);
        player.inventory.remove(item.id);
        player.inventory.add(BURNT_MEAT_ID);
        player.message("This meat is too delicate to cook like this.");
        player.message("Perhaps you can wrap something around it to protect it from the heat.");
        return true;
    }

    if (!uncooked.hasOwnProperty(item.id)) {
        return false;
    }

    let isRange;
    let isCooksRange = false;

    if (FIRE_IDS.has(gameObject.id)) {
        isRange = false;
    } else if (RANGE_IDS.has(gameObject.id)) {
        isRange = true;
    } else if (gameObject.id === COOKS_RANGE_ID) {
        if (player.questStages.cooksAssistant !== -1) {
            return false;
        }

        isRange = true;
        isCooksRange = true;
    } else {
        return false;
    }

    const cookingLevel = player.skills.cooking.current;

    const {
        level,
        experience,
        cooked: cookedID,
        burnt: burntID,
        roll,
        range: needsRange
    } = getDefinition(item.id);

    let cookedName = item.definition.name
        .toLowerCase()
        .replace('raw ', '')
        .replace('uncooked ', '');

    if (cookingLevel < level) {
        player.message(
            `@que@You need a cooking level of ${level} to cook ${cookedName}`
        );

        return true;
    }

    let cookTicks = 3;

    if (needsRange) {
        cookTicks += 2;

        if (!isRange) {
            player.message('@que@You need a proper oven to cook this');
            return true;
        }
    }

    if (isMeat(item)) {
        cookedName = 'meat';
    }

    if (needsRange) {
        player.message(`You cook the ${cookedName} in the oven...`);
    } else {
        // ( QUEST) You cook the stew on the range...
        // from 08-01-2018 21.50.15 cooking pizza and cake
        // by Tylerberg
        const rangeName = /stew/.test(cookedName) ? 'range' : 'stove';

        // (QUEST) You cook the meat on the stove...
        // (QUEST) You cook the meat on the fire...
        const ellipsis = /(meat|stew)/.test(cookedName) ? '...' : '';

        player.message(
            `You cook the ${cookedName} on the ` +
            `${isRange ? rangeName : 'fire'}${ellipsis}`
        );
    }

    player.sendBubble(item.id);

    if (player.isTired()) {
        player.message('You are too tired to cook this food');
        return true;
    }

    const { world } = player;

    player.sendSound('cooking');
    await world.sleepTicks(cookTicks);

    player.inventory.remove(item.id);

    let lowRoll = roll[0];

    if (!isRange) {
        lowRoll *= FIRE_PENALTY;
    } else if (isCooksRange) {
        lowRoll *= COOKS_RANGE_BONUS;
    }

    // Authentic RSC Formula
    // levelStopFail is usually req + 35 for cooking (except specific cases handled in data)
    // but here we use the data's 'stopFail' if available, or default logic
    const levelStopFail = level + 35; // Default for cooking if not specified

    // Gauntlets Logic (Family Crest)
    // ID 701 is "Cooking gauntlets" in authentic lists usually.
    let effectiveLevel = cookingLevel;
    if (player.equipment.has(GAUNTLETS_OF_COOKING_ID)) {
        if (item.id === RAW_SWORDFISH_ID) effectiveLevel += 6;
        if (item.id === RAW_LOBSTER_ID) effectiveLevel += 11;
        if (item.id === RAW_SHARK_ID) effectiveLevel += 11;
    }

    const cookSuccess = calcProductionSuccessfulLegacy(level, effectiveLevel, true, levelStopFail);

    if (/pie/.test(cookedName)) {
        cookedName = 'pie';
    }

    if (/cake/.test(cookedName)) {
        player.inventory.add(CAKE_TIN_ID);
    }

    if (cookSuccess) {
        player.inventory.add(cookedID);
        player.addExperience('cooking', experience);

        if (needsRange) {
            player.message(`You remove the ${cookedName} from the oven`);
        } else {
            player.message(`The ${cookedName} is now nicely cooked`);
        }
    } else {
        player.inventory.add(burntID);
        player.message(`@que@You accidentially burn the ${cookedName}`);
    }

    return true;
}

module.exports = { onUseWithGameObject };
