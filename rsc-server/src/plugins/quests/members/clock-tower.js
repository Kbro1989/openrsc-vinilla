const QUEST_NAME = 'Clock Tower';
const QUEST_POINTS = 1;

// NPC IDs
const NPC_BROTHER_KOJO = 366;
const NPC_DUNGEON_RAT = 296; // Need to verify rat ID, assuming standard or specific

// Item IDs
const ITEM_COINS = 10;
const ITEM_BUCKET_WATER = 50;
const ITEM_ICE_GLOVES = 556;
const ITEM_RAT_POISON = 731;
const ITEM_LARGE_COG_BLUE = 727;
const ITEM_LARGE_COG_BLACK = 728;
const ITEM_LARGE_COG_RED = 729;
const ITEM_LARGE_COG_PURPLE = 730;

// Object IDs
const OBJ_CLOCK_POLE_BLUE = 362;
const OBJ_CLOCK_POLE_RED = 363;
const OBJ_CLOCK_POLE_PURPLE = 364;
const OBJ_CLOCK_POLE_BLACK = 365;

const OBJ_GATE_CLOSED = 371;
const OBJ_GATE_OPEN = 372;
const OBJ_LEVER_1 = 373;
const OBJ_LEVER_2 = 374;
const OBJ_FOOD_TROUGH = 375;
const OBJ_RAT_CAGE_CELL = 111;
const OBJ_SECRET_DOOR = 22;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

// Brother Kojo Dialogue
async function onTalkToNpc(player, npc) {
    if (npc.id !== NPC_BROTHER_KOJO) return false;

    const stage = getQuestStage(player);

    if (stage === 0) {
        await npc.say('Hello traveller, I\'m Brother Kojo');
        await npc.say('Do you know the time?');
        await player.say('No... Sorry');
        await npc.say('Oh dear, oh dear, I must fix the clock');
        await npc.say('The town people are becoming angry');
        await npc.say('Please could you help?');

        const choice = await player.ask([
            'Ok old monk what can I do?',
            'Not now old monk'
        ], true);

        if (choice === 0) {
            await npc.say('Oh thank you, you are very kind');
            await npc.say('In the cellar below you\'ll find four cogs');
            await npc.say('They\'re too heavy for me, but you should');
            await npc.say('Be able to carry them one at a time');
            await npc.say('One goes on each floor');
            await npc.say('But I can\'t remember which goes where');
            await player.say('I\'ll do my best');
            await npc.say('Be careful, strange beasts dwell in the cellars');
            setQuestStage(player, 1);
        } else {
            await npc.say('Ok then');
        }
    } else if (stage === 1) {
        // Check if all cogs are placed
        if (player.getCache('cog_placed_blue') &&
            player.getCache('cog_placed_black') &&
            player.getCache('cog_placed_red') &&
            player.getCache('cog_placed_purple')) {

            await player.say('I have replaced all the cogs');
            await npc.say('Really..? wait, listen');
            player.message('Tick Tock, Tick Tock');
            await npc.say('Well done, well done');
            player.message('Tick Tock, Tick Tock');
            await npc.say('Yes yes yes, you\'ve done it');
            await npc.say('You are clever');
            player.message('You have completed the clock tower quest');
            await npc.say('That will please the village folk');
            await npc.say('Please take these coins as a reward');

            player.inventory.add(ITEM_COINS, 500);
            player.addQuestPoints(QUEST_POINTS);
            setQuestStage(player, -1);
            // Clear cache
            player.removeCache('cog_placed_blue');
            player.removeCache('cog_placed_black');
            player.removeCache('cog_placed_red');
            player.removeCache('cog_placed_purple');
            player.removeCache('rats_poisoned');
        } else {
            await player.say('Hello again');
            await npc.say('Oh hello, are you having trouble?');
            await npc.say('The cogs are in four rooms below us');
            await npc.say('Place one cog on a pole on each');
            await npc.say('Of the four tower levels');
        }
    } else if (stage === -1) {
        await player.say('Hello again Brother Kojo');
        await npc.say('Oh hello there traveller');
        await npc.say('You\'ve done a grand job with the clock');
        await npc.say('It\'s just like new');
    }
    return true;
}

// Object Interactions
async function onUseItemOnObject(player, item, object) {
    const stage = getQuestStage(player);

    // Poisoning the rats
    if (object.id === OBJ_FOOD_TROUGH && item.id === ITEM_RAT_POISON) {
        player.message('You pour the rat poison into the feeding trough');
        player.inventory.remove(ITEM_RAT_POISON, 1);
        player.setCache('rats_poisoned', true);

        // Check if rats should die (simplified logic here, typically visual only in plugins unless we despawn)
        player.message('The rats start eating the poison...');
        await player.world.sleepTicks(3);
        player.message('They seem to be getting weak...');
        // In a real server we might loop through NPCs to kill them, 
        // but for now we trust the cache for the gate logic.
        return true;
    }

    // Placing Cogs
    if ([OBJ_CLOCK_POLE_BLUE, OBJ_CLOCK_POLE_RED, OBJ_CLOCK_POLE_PURPLE, OBJ_CLOCK_POLE_BLACK].includes(object.id)) {
        let placed = false;

        // Define correct mappings
        // Authentic logic:
        // Blue Cog (727) -> Blue Pole (362) (Ground Floor? verify loc)
        // Black Cog (728) -> Black Pole (365)
        // Red Cog (729) -> Red Pole (363)
        // Purple Cog (730) -> Purple Pole (364)

        if (item.id === ITEM_LARGE_COG_BLUE && object.id === OBJ_CLOCK_POLE_BLUE) {
            if (object.x === 580 && object.y === 3470) { // Verify coordinates if necessary, or just rely on ID
                placed = true;
                player.setCache('cog_placed_blue', true);
            }
        }
        else if (item.id === ITEM_LARGE_COG_BLACK && object.id === OBJ_CLOCK_POLE_BLACK) {
            if (object.x === 581 && object.y === 639) {
                placed = true;
                player.setCache('cog_placed_black', true);
            }
        }
        else if (item.id === ITEM_LARGE_COG_RED && object.id === OBJ_CLOCK_POLE_RED) {
            if (object.x === 582 && object.y === 1582) {
                placed = true;
                player.setCache('cog_placed_red', true);
            }
        }
        else if (item.id === ITEM_LARGE_COG_PURPLE && object.id === OBJ_CLOCK_POLE_PURPLE) {
            if (object.x === 581 && object.y === 2525) {
                placed = true;
                player.setCache('cog_placed_purple', true);
            }
        }

        if (placed) {
            player.message('The cog fits perfectly');
            player.inventory.remove(item.id, 1);
            return true;
        } else if ([ITEM_LARGE_COG_BLUE, ITEM_LARGE_COG_BLACK, ITEM_LARGE_COG_RED, ITEM_LARGE_COG_PURPLE].includes(item.id)) {
            player.message('The cog doesn\'t fit');
            return true;
        }
    }

    return false;
}

// Handling pickup of hot/black cog
function onTakeObject(player, object) {
    if (object.id === ITEM_LARGE_COG_BLACK) { // Assuming it spawns as ground item 728
        // Check for Ice Gloves or Water Bucket
        // This logic is tricky in RSClib because onTakeObject usually happens *before* pickup
        // Authentic logic: need ice gloves equipped OR use bucket of water on it first.

        // If just trying to take it:
        if (player.inventory.has(ITEM_ICE_GLOVES, true)) { // equipped
            player.message('The ice gloves cool down the cog');
            player.message('You take the cog');
            return false; // Allow pickup
        } else {
            player.message('The cog is red hot from the flames, too hot to carry');
            return true; // Block pickup
        }
    }
    return false;
}

// Using Water Bucket on Ground Item (Black Cog)
function onUseItemOnGroundItem(player, item, groundItem) {
    if (item.id === ITEM_BUCKET_WATER && groundItem.id === ITEM_LARGE_COG_BLACK) {
        player.message('You pour water over the cog');
        player.message('The cog quickly cools down');
        player.message('You take the cog');
        player.inventory.remove(ITEM_BUCKET_WATER, 1);
        player.inventory.add(21, 1); // Empty bucket
        player.inventory.add(ITEM_LARGE_COG_BLACK, 1);
        // We need to implement removing the ground item manually or let the server handle it?
        // Usually server handles removal if we return true? 
        // But here we are adding it manually. 
        // Simplest is to map this to a "cool down" state for the object, but authentication does direct pickup.
        // For this framework, deleting the ground item might be needed.
        groundItem.remove();
        return true;
    }
    return false;
}

async function onOpObject(player, object) {
    // Gate Logic (Rats)
    if (object.id === OBJ_LEVER_1 || object.id === OBJ_LEVER_2) {
        // This is complex multi-gate logic.
        // For now, let's just say it toggles the nearby gates.
        // Authentic logic checks pairs of gates.
        const nearbyGate = player.world.getGameObject([OBJ_GATE_CLOSED, OBJ_GATE_OPEN], 10); // simplistic search
        if (nearbyGate) {
            if (nearbyGate.id === OBJ_GATE_CLOSED) {
                player.message('The gate swings open');
                player.world.replaceObject(nearbyGate, OBJ_GATE_OPEN); // Need correct replacement method
            } else {
                player.message('The gate creaks shut');
                player.world.replaceObject(nearbyGate, OBJ_GATE_CLOSED);
            }
        }

        // Check rat poison condition
        if (player.getCache('rats_poisoned')) {
            if (player.getCache('rats_dead')) return true; // already dead
            // Check if gates block the rats, etc. 
            // Authentic: If gates are correct + poison used -> rats die.
            player.message('The rats are dying!');
            player.setCache('rats_dead', true);
            // Remove rats from view?
        }
        return true;
    }

    if (object.id === OBJ_RAT_CAGE_CELL) { // 111 (Wall Object?)
        if (player.getCache('rats_dead')) {
            player.message('In a panic to escape, the rats have bent the bars');
            player.message('You can just crawl through');
            // Teleport through
            if (player.y <= 3475) player.teleport(player.x, 3476);
            else player.teleport(player.x, 3475);
        } else {
            player.message('The bars are too strong to bend');
        }
        return true;
    }

    return false;
}

module.exports = {
    name: 'clock-tower',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onUseItemOnObject,
    onUseItemOnGroundItem, // Need to verify if this hook exists in rsc-server
    onOpObject,
    onTakeObject,
    npcs: [NPC_BROTHER_KOJO],
    objects: [OBJ_CLOCK_POLE_BLUE, OBJ_CLOCK_POLE_RED, OBJ_CLOCK_POLE_PURPLE, OBJ_CLOCK_POLE_BLACK, OBJ_LEVER_1, OBJ_LEVER_2, OBJ_FOOD_TROUGH, OBJ_RAT_CAGE_CELL]
};
