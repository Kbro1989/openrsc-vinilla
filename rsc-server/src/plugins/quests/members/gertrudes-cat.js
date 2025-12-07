const QUEST_NAME = 'Gertrude\'s Cat';
const QUEST_POINTS = 1;

// NPC IDs
const NPC_GERTRUDE = 303;
const NPC_WILOUGH = 301;
const NPC_SHILOP = 302;
// Fluffs (NpcId.GERTRUDES_CAT) handled mostly via item/obj triggers in authentic? 
// No, authentic uses GroundItem logic for the cat "Item ID 1099" on ground?
// Authentic file says: "blockTakeObj ... i.getID() == ItemId.GERTRUDES_CAT.id()"
// So Fluffs appears as a Ground Item initially? Or an NPC? 
// Java: "GroundItem i ... i.getID() == ItemId.GERTRUDES_CAT.id()". 
// ID 1099 is "Gertrudes Cat" item. 
// However, typically in RSC, NPCs are used for interaction. 
// Authentic code uses `onTakeObj` (Ground Item). This implies Fluffs is spawned as a GroundItem that cannot be picked up until conditions met?
// Wait, authentic logic: "blockTakeObj... return true". It PREVENTS picking it up.
// Instead, you use items on this GroundItem.
const ITEM_GERTRUDES_CAT_GROUND = 1099; // Ground Item ID

// Item IDs
const ITEM_COOKED_SARDINE = 356; // ? "Raw sardines seasoned"? No, Seasoned Sardine is 1103. Raw is 354.
const ITEM_RAW_SARDINE = 354;
const ITEM_DOOGLE_LEAVES = 1102;
const ITEM_SEASONED_SARDINE = 1103;
const ITEM_MILK = 22;
const ITEM_KITTEN = 1098; // Reward? Or the one found?
const ITEM_KITTENS_BOX = 1101; // "He gives you kittens"? Authentic says "ItemId.KITTENS.id()" which is 1101 usually.
const ITEM_COINS = 10;
const ITEM_CHOCOLATE_CAKE = 338;
const ITEM_STEW = 346;

// Object IDs
const OBJ_CRATE_SEARCH = 1039; // Search for kittens
const OBJ_BARREL_SEARCH = 1041;
const OBJ_CRATE_FIND = 1040; // Find kittens here
const OBJ_FENCE_BROKEN = 199; // Lumberyard entrance

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

// ----------------------------------------
// NPC Interactions
// ----------------------------------------

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // --- Gertrude ---
    if (npc.id === NPC_GERTRUDE) {
        if (stage === 0) {
            await npc.say('Hello, are you ok?');
            await npc.say('Do I look ok? Those kids drive me crazy');
            await npc.say('I\'ve lost my poor Fluffs');
            const choice = await player.ask(['Well, I suppose I could help', 'What\'s in it for me?'], true);

            if (choice === 0 || choice === 1) {
                // If choice 1 (reward), she says she is poor but offers a meal.
                if (choice === 1) await npc.say('I\'m too poor to pay, but I can offer a warm meal');

                await npc.say('Please find her. Ask my sons Shilop and Wilough in the market');
                setQuestStage(player, 1);
            }
        } else if (stage === 1) {
            await npc.say('Have you seen my poor Fluffs?');
            await player.say('Not yet');
            await npc.say('Ask Shilop at the market');
        } else if (stage === 2) {
            if (player.getCache('fluffs_fed') && player.getCache('fluffs_milk') && player.getCache('fluffs_kittens')) {
                // Logic handled in returning kittens mainly
            }
            await npc.say('Any luck?');
            await player.say('I found her but she won\'t leave');
            await npc.say('She must be hungry. She loves Doogle Sardines');
        } else if (stage === 3 || stage === -1) {
            await npc.say('You\'re back! Thank you!');
            if (stage === 3) {
                await npc.say('Fluffs came back with her kittens');
                await npc.say('Please take this kitten as a reward');
                player.inventory.add(ITEM_KITTEN, 1);
                player.inventory.add(ITEM_CHOCOLATE_CAKE, 1);
                player.inventory.add(ITEM_STEW, 1);
                player.addQuestPoints(QUEST_POINTS);
                // XP? Authentic has XP rewards in handleReward
                player.addExperience(12, 1525); // Cooking
                setQuestStage(player, -1);
                player.message('You have completed Gertrude\'s Cat quest');
            }
        }
    }

    // --- Shilop / Wilough ---
    if ([NPC_SHILOP, NPC_WILOUGH].includes(npc.id)) {
        if (stage === 1) {
            await npc.say('I don\'t talk to strangers');
            // Authentic Dialogue path to bribe them
            const bribe = await player.ask(['Tell me or I\'ll hurt you', 'What will make you tell me?'], true);
            if (bribe === 1) {
                await npc.say('100 coins should cover it');
                const pay = await player.ask(['Ok then, I\'ll pay', 'I\'m not paying'], true);
                if (pay === 0) {
                    if (player.inventory.remove(ITEM_COINS, 100)) {
                        await npc.say('I saw Fluffs at the Lumber Yard. You need to find a broken fence.');
                        setQuestStage(player, 2);
                    } else {
                        await npc.say('Come back when you have the money');
                    }
                }
            }
        } else if (stage === 2) {
            await npc.say('I told you, she\'s at the Lumber Yard');
        }
    }
}

// ----------------------------------------
// Object Interactions
// ----------------------------------------

async function onOpLoc(player, object) {
    // --- Broken Fence ---
    if (object.id === OBJ_FENCE_BROKEN) {
        player.message('You squeeze through the broken fence');
        if (player.x <= 50) player.teleport(51, 438);
        else player.teleport(50, 438);
        return true;
    }

    // --- Crates (Kittens) ---
    if (object.id === OBJ_CRATE_SEARCH || object.id === OBJ_BARREL_SEARCH) {
        player.message('You search...');
        player.message('You hear a cat purring but find nothing');
        return true;
    }

    if (object.id === OBJ_CRATE_FIND) {
        player.message('You search the crate...');
        if (!player.inventory.has(ITEM_KITTENS_BOX)) { // "Kittens" item
            player.message('You find the missing kittens!');
            player.inventory.add(ITEM_KITTENS_BOX, 1);
        }
        return true;
    }

    return false;
}

// ----------------------------------------
// Item on Ground Item (Fluffs Logic)
// ----------------------------------------
// Fluffs is implemented as a GROUND ITEM in Authentic RSC.
// ID 1099 "Gertrude's Cat".

async function onUseItemOnGroundItem(player, item, groundItem) {
    if (groundItem.id === ITEM_GERTRUDES_CAT_GROUND) {
        if (item.id === ITEM_MILK) {
            player.message('You give the cat some milk');
            player.message('She drinks it but still won\'t leave');
            player.inventory.remove(ITEM_MILK, 1);
            player.setCache('fluffs_milk', true);
            return true;
        }
        if (item.id === ITEM_SEASONED_SARDINE) {
            player.message('You give the cat the seasoned sardine');
            player.message('She eats it but is still afraid');
            player.inventory.remove(ITEM_SEASONED_SARDINE, 1);
            player.setCache('fluffs_fed', true);
            return true;
        }
        if (item.id === ITEM_KITTENS_BOX) {
            player.message('You show the kittens to Fluffs');
            player.message('She purrs and runs home with them!');
            player.inventory.remove(ITEM_KITTENS_BOX, 1);
            player.world.removeEntity('groundItems', groundItem); // Remove Fluffs
            setQuestStage(player, 3);
            return true;
        }
    }
    return false;
}

// ----------------------------------------
// Inventory Actions (Seasoning Sardine)
// ----------------------------------------
async function onUseItemOnItem(player, item1, item2) {
    if ((item1.id === ITEM_RAW_SARDINE && item2.id === ITEM_DOOGLE_LEAVES) ||
        (item1.id === ITEM_DOOGLE_LEAVES && item2.id === ITEM_RAW_SARDINE)) {
        player.message('You rub the Doogle Leaves on the Sardine');
        player.inventory.remove(ITEM_RAW_SARDINE, 1);
        player.inventory.remove(ITEM_DOOGLE_LEAVES, 1);
        player.inventory.add(ITEM_SEASONED_SARDINE, 1);
        return true;
    }
    return false;
}

module.exports = {
    name: 'gertrudes-cat',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    onUseItemOnGroundItem,
    onUseItemOnItem,
    npcs: [NPC_GERTRUDE, NPC_WILOUGH, NPC_SHILOP],
    objects: [OBJ_FENCE_BROKEN, OBJ_CRATE_SEARCH, OBJ_BARREL_SEARCH, OBJ_CRATE_FIND]
};
