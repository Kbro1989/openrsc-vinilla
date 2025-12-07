const QUEST_NAME = 'Waterfall Quest';
const QUEST_POINTS = 1;

// NPC IDs
const NPC_ALMERA = 304;
const NPC_HUDON = 305;
const NPC_GERALD = 306; // Fisherman
const NPC_HADLEY = 307; // Tourist Guide
const NPC_GOLRIE = 308; // Dwarf in cave

// Item IDs
const ITEM_ROPE = 237;
const ITEM_BOOK_ON_BAXTORIAN = 782; // Verify ID
const ITEM_LARGE_KEY = 783; // For Golrie's door
const ITEM_GLARIALS_PEBBLE = 784;
const ITEM_GLARIALS_AMULET = 785;
const ITEM_GLARIALS_URN = 786;
const ITEM_OLD_KEY = 787; // Inside dungeon
const ITEM_AIR_RUNE = 33;
const ITEM_WATER_RUNE = 32;
const ITEM_EARTH_RUNE = 34;
const ITEM_MITHRIL_SEEDS = 788; // Reward
const ITEM_GOLD_BAR = 172;
const ITEM_DIAMOND = 161;

// Object IDs
const OBJ_RAFT = 464;
const OBJ_TREE_1 = 462; // Jump/Rope
const OBJ_TREE_2 = 463;
const OBJ_ROCK_LEDGE = 482; // "Jump off" or Rope
const OBJ_BOOKCASE = 470;
const OBJ_CRATE_KEY = 481; // Golrie's Key
const OBJ_DOOR_GOLRIE = 480;
const OBJ_TOMBSTONE_GLARIAL = 479;
const OBJ_COFFIN_AMULET = 467;
const OBJ_CUPBOARD_URN = 507; // 506 closed, 507 open
const OBJ_DOOR_DUNGEON = 135; // Needs Old Key
const OBJ_CRATE_OLD_KEY = 492;
const OBJ_CHALICE = 485;
const OBJ_PILLAR_STAND = 473; // Stand range 473-478

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

    if (npc.id === NPC_ALMERA) {
        if (stage === 0) {
            await npc.say('Hello madam');
            await npc.say('Ah, hello there, nice to see an outsider');
            await npc.say('Are you busy? I have a problem');
            const choice = await player.ask(['I\'m afraid I\'m in a rush', 'How can I help?'], true);

            if (choice === 1) {
                await npc.say('It\'s my son Hudon, he\'s always getting into trouble');
                await npc.say('He\'s convinced there\'s treasure in the river');
                await npc.say('The poor lad can\'t even swim');
                await player.say('I could go and take a look for you');
                await npc.say('Would you? You can use the small raft out back');
                setQuestStage(player, 1);
            }
        } else if (stage === 1) {
            await npc.say('Have you seen my boy yet?');
            await player.say('Not yet');
        } else if (stage === 2) {
            await npc.say('Well hello, you\'re still around');
            await player.say('I saw Hudon by the river but he refused to come back');
            await npc.say('Yes he told me, he fell in the waterfall!');
            await npc.say('Lucky he wasn\'t killed');
            await npc.say('Why don\'t you visit the tourist centre south of the waterfall?');
            // Hint to go to Hadley
        } else {
            await npc.say('Hello adventurer, how\'s your treasure hunt going?');
        }
    }

    if (npc.id === NPC_HUDON) {
        if (stage === 1) {
            await player.say('Hello Hudon, your mother sent me');
            await npc.say('Don\'t play nice with me');
            await npc.say('I know you\'re looking for the treasure too');
            await player.say('Where is this treasure?');
            await npc.say('If I told you, you\'d take it all');
            await npc.say('I\'m fine alone');
            player.message('Hudon is refusing to leave');
            setQuestStage(player, 2);
        } else if (stage >= 2) {
            await npc.say('I\'ll find that treasure soon, just you wait');
        }
    }

    if (npc.id === NPC_HADLEY) {
        await npc.say('Hello there, I\'m Hadley the tourist guide');
        await npc.say('Have you seen the Baxtorian Waterfall?');
        const choice = await player.ask([
            'Can you tell me what happened to the Elf King?',
            'Where else is worth visiting?'
        ], true);

        if (choice === 0) {
            await npc.say('Baxtorian returned to find his wife Glarial captured');
            await npc.say('He reclused to a secret home under the waterfall');
            await npc.say('Only Glarial could enter');
            await player.say('What happened to him?');
            await npc.say('I believe we have some pages upstairs in our archives');
        } else if (choice === 1) {
            await npc.say('There\'s a lovely spot to the north east');
            await npc.say('There lies a monument to Queen Glarial');
        }
    }

    if (npc.id === NPC_GOLRIE) {
        await player.say('Is your name Golrie?');
        await npc.say('That\'s me, I\'ve been stuck here for weeks');
        await npc.say('Goblins are trying to steal my family heirlooms');

        if (player.inventory.has(ITEM_LARGE_KEY)) {
            await player.say('I found a key');
            await npc.say('Thanks! Here, take this old pebble I found');
            player.inventory.remove(ITEM_LARGE_KEY, 1);
            player.inventory.add(ITEM_GLARIALS_PEBBLE, 1);
            player.setCache('golrie_key', true); // Unlocked
        } else if (player.getCache('golrie_key')) {
            await npc.say('Thanks again for the key');
        } else {
            await npc.say('I locked myself in but lost the key');
            await player.say('I\'ll look for it');
        }
    }

    return true;
}

// ----------------------------------------
// Object Interactions
// ----------------------------------------

async function onOpLoc(player, object) {
    // --- Raft ---
    if (object.id === OBJ_RAFT) {
        player.message('You board the small raft...');
        await player.world.sleepTicks(2);
        player.message('You crash into a small land mound!');
        player.teleport(662, 463); // Crash island
        if (getQuestStage(player) === 1) {
            // Check for Hudon nearby in authentic, but we handled via TalkNpc
        }
        return true;
    }

    // --- Bookcase ---
    if (object.id === OBJ_BOOKCASE) {
        player.message('You search the bookcase...');
        if (!player.inventory.has(ITEM_BOOK_ON_BAXTORIAN)) {
            player.message('And find a book named "Book on Baxtorian"');
            player.inventory.add(ITEM_BOOK_ON_BAXTORIAN, 1);
        } else {
            player.message('But find nothing of interest');
        }
        return true;
    }

    // --- Crate (Golrie's Key) ---
    if (object.id === OBJ_CRATE_KEY) {
        player.message('You search the crate...');
        if (!player.inventory.has(ITEM_LARGE_KEY) && !player.getCache('golrie_key')) {
            player.message('And find a large key');
            player.inventory.add(ITEM_LARGE_KEY, 1);
        } else {
            player.message('It is empty');
        }
        return true;
    }

    // --- Glarial's Tombstone ---
    if (object.id === OBJ_TOMBSTONE_GLARIAL) {
        player.message('The grave is covered in Elven script');
        player.message('"Here lies Glarial, wife of Baxtorian"');
        return true;
    }

    // --- Glarial's Amulet (Coffin) ---
    if (object.id === OBJ_COFFIN_AMULET) {
        player.message('You search the coffin...');
        if (!player.inventory.has(ITEM_GLARIALS_AMULET)) {
            player.message('Inside you find a small amulet');
            player.inventory.add(ITEM_GLARIALS_AMULET, 1);
        } else {
            player.message('It is empty');
        }
        return true;
    }

    // --- Glarial's Urn (Cupboard) ---
    if ([506, 507].includes(object.id)) { // Cupboard
        if (!player.inventory.has(ITEM_GLARIALS_URN)) {
            player.message('You search the cupboard...');
            player.message('And find a metal urn');
            player.inventory.add(ITEM_GLARIALS_URN, 1);
        } else {
            player.message('It is empty');
        }
        return true;
    }

    // --- Chalice (Finale) ---
    if (object.id === OBJ_CHALICE) {
        // Should use Urn on it, usually OpLoc doesn't handle "Touching" unless configured
        // Authentic: "If quest stage -1: Empty. Else: Tips over, floods."
        // If they touch it without using Urn, they wash away.
        player.message('As you touch the chalice it tips over!');
        player.message('Water floods into the cavern!');
        player.teleport(654, 485); // Washed out
        player.damage(5);
        return true;
    }

    return false;
}

// --- Using Items on Objects ---

async function onUseItemOnObject(player, item, object) {
    // --- Rope on Tree ---
    if (item.id === ITEM_ROPE && [OBJ_TREE_1, OBJ_TREE_2, OBJ_ROCK_LEDGE].includes(object.id)) {
        player.message('You tie the rope to the tree/rock and pull yourself across');
        // Based on ID, teleport to specific ledges
        if (object.id === OBJ_TREE_1) player.teleport(662, 467);
        else if (object.id === OBJ_TREE_2) player.teleport(659, 471);
        else if (object.id === OBJ_ROCK_LEDGE) player.teleport(659, 3305); // Entrance to waterfall logic
        return true;
    }

    // --- Pebble on Tombstone ---
    if (item.id === ITEM_GLARIALS_PEBBLE && object.id === OBJ_TOMBSTONE_GLARIAL) {
        player.message('You place the pebble in the indent. It fits perfectly.');
        player.message('The stone slab slides back revealing a ladder');
        player.teleport(631, 3305); // Into Tomb
        if (getQuestStage(player) === 2) setQuestStage(player, 3);
        return true;
    }

    // --- Urn on Chalice ---
    if (item.id === ITEM_GLARIALS_URN && object.id === OBJ_CHALICE) {
        player.message('You pour the urn\'s ashes into the chalice');
        player.message('A magical force fills the room');
        player.message('You have completed the Waterfall Quest!');
        player.addQuestPoints(QUEST_POINTS);
        player.inventory.remove(ITEM_GLARIALS_URN, 1);
        player.inventory.add(ITEM_MITHRIL_SEEDS, 40);
        player.inventory.add(ITEM_GOLD_BAR, 2);
        player.inventory.add(ITEM_DIAMOND, 2);
        // XP Rewards handled by generic handler usually, but here:
        player.addExperience(0, 13750); // Attack
        player.addExperience(2, 13750); // Strength
        setQuestStage(player, -1);
        return true;
    }

    // --- Runes on Pillars ---
    if ([ITEM_WATER_RUNE, ITEM_AIR_RUNE, ITEM_EARTH_RUNE].includes(item.id)) {
        // Range check 473-478
        if (object.id >= 473 && object.id <= 478) {
            player.message('You place the rune on the pillar');
            player.inventory.remove(item.id, 1);
            player.setCache('pillar_' + object.id, true);
            // Check if all pillars filled? Usually authentic logic checks this when using Amulet on Statue
            return true;
        }
    }

    // --- Amulet on Statue ---
    if (item.id === ITEM_GLARIALS_AMULET && object.id === 483) { // Statue
        player.message('You place Glarial\'s Amulet on the statue');
        player.message('The ground rumbles and the floor rises');
        // Authentic: Raises floor to reach Chalice
        // For now, assume it modifies world or teleports player to "high" chalice level
        // Simply allow access to Chalice
        return true;
    }

    return false;
}

module.exports = {
    name: 'waterfall-quest',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    onUseItemOnObject,
    npcs: [NPC_ALMERA, NPC_HUDON, NPC_HADLEY, NPC_GOLRIE, NPC_GERALD],
    objects: [OBJ_RAFT, OBJ_BOOKCASE, OBJ_CRATE_KEY, OBJ_TOMBSTONE_GLARIAL, OBJ_COFFIN_AMULET,
        OBJ_CUPBOARD_URN, 506, OBJ_CHALICE, OBJ_TREE_1, OBJ_TREE_2, OBJ_ROCK_LEDGE,
        473, 474, 475, 476, 477, 478, 483]
};
