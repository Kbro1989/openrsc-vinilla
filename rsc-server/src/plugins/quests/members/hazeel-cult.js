const QUEST_NAME = 'Hazeel Cult';
const QUEST_POINTS = 1;

// NPC IDs
const NPC_CERIL = 500;
const NPC_BUTLER_JONES = 501;
const NPC_HENRYETA = 502;
const NPC_PHILIPE = 503;
const NPC_CLAUS = 504; // Cook
const NPC_CARNILLEAN_GUARD = 505;
const NPC_CLIVET = 506; // First cult contact
const NPC_CULT_MEMBER = 507;
const NPC_ALOMONE = 508; // Cult leader
const NPC_LORD_HAZEEL = 509; // Summoned (Evil path)

// Item IDs
const ITEM_COINS = 10;
const ITEM_POISON = 890;
const ITEM_MARK_OF_HAZEEL = 891;
const ITEM_CARNILLEAN_ARMOUR = 892;
const ITEM_CARNILLEAN_KEY = 893;
const ITEM_SCRIPT_OF_HAZEEL = 894;

// Object IDs
const OBJ_BUTLERS_CUPBOARD_OPEN = 441;
const OBJ_BUTLERS_CUPBOARD_CLOSED = 440;
const OBJ_BASEMENT_CRATE = 439;
const OBJ_BOOKCASE = 436;
const OBJ_CHEST_CLOSED = 438;
const OBJ_CHEST_OPEN = 437;

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
    const isGood = player.getCache('good_side');
    const isEvil = player.getCache('evil_side');

    // --- Ceril (Quest Start) ---
    if (npc.id === NPC_CERIL) {
        if (stage === 0) {
            await npc.say('Blooming, thieving, weirdos!');
            await npc.say('Why don\'t they leave me alone?');
            const choice = await player.ask([
                'What\'s wrong?',
                'You probably deserve it'
            ], true);

            if (choice === 0) {
                await npc.say('It\'s those strange folk from the forest');
                await npc.say('They\'ve broken in four times since');
                await npc.say('My old butler followed them to a cave entrance');
                await npc.say('Could you help retrieve my stolen armour?');
                const help = await player.ask(['Yes, of course', 'No thanks'], true);
                if (help === 0) {
                    await npc.say('Thank you. Go south into the forest');
                    setQuestStage(player, 1);
                }
            }
        } else if (stage === 4 && isGood) {
            if (player.inventory.has(ITEM_CARNILLEAN_ARMOUR)) {
                await player.say('Look, I\'ve found the armour');
                await npc.say('Well done! But that butler Jones...');
                // Trigger confrontation with Butler
                player.message('Ceril takes you upstairs to confront Butler Jones');
                await npc.say('He assures me he\'s loyal');
                await npc.say('Here is 5 coins. Go find REAL proof.');
                player.inventory.give(ITEM_COINS, 5);
                setQuestStage(player, 5);
            } else {
                await npc.say('Have you found the armour?');
            }
        } else if (stage === -1 && isGood) {
            await npc.say('Hello. Thank you again for saving my family!');
        } else if (stage === -1 && isEvil) {
            await npc.say('Ever since I asked for your help, things got worse');
            await npc.say('I think you should keep out of my way.');
        }
        return true;
    }

    // --- Clivet (Choice Point) ---
    if (npc.id === NPC_CLIVET) {
        if (stage === 1) {
            await npc.say('You\'re a fool if you think you\'ll find it here.');
            await player.say('I know you\'re hiding something');
            await npc.say('The Carnilleans murdered Lord Hazeel and stole his property!');

            const choice = await player.ask([
                'You\'re crazy, I\'d never help you',
                'So what would I have to do?'
            ], true);

            if (choice === 0) {
                // GOOD PATH
                await npc.say('Then you\'re a fool. Go back to your adventures.');
                player.message('Clivet escapes down the sewer.');
                player.setCache('good_side', true);
                setQuestStage(player, 3);
            } else {
                // EVIL PATH START
                await npc.say('First you must prove your loyalty.');
                await npc.say('Poison one of the Carnillean family members.');
                const commit = await player.ask(['No, I won\'t do it', 'Ok, I\'ll do it'], true);
                if (commit === 0) {
                    player.setCache('good_side', true);
                    setQuestStage(player, 3);
                } else {
                    await npc.say('Good. Take this poison.');
                    player.inventory.add(ITEM_POISON, 1);
                    player.setCache('evil_side', true);
                    setQuestStage(player, 3);
                }
            }
            return true;
        } else if (stage >= 3 && isEvil) {
            await npc.say('Have you poisoned them yet? Return once the deed is done.');
        }
        return true;
    }

    // --- Alomone (Cult Leader) ---
    if (npc.id === NPC_ALOMONE) {
        if (stage === 3 && isGood) {
            await npc.say('How did you get in here?');
            await player.say('I\'ve come for the Carnillean family armour.');
            await npc.say('I told the butler to get rid of you!');
            player.message('Alomone attacks you!');
            // Start combat
            npc.setTarget(player);
        } else if (stage === 4 && isEvil) {
            await npc.say('Ah, you\'ve proven yourself.');
            await npc.say('We must retrieve the Sacred Script of Hazeel from the Carnillean house.');
            await npc.say('Butler Jones is one of us. He will help.');
            setQuestStage(player, 5);
        } else if (stage === 6 && isEvil) {
            if (player.inventory.has(ITEM_SCRIPT_OF_HAZEEL)) {
                await npc.say('You have the script! Finally, our lord Hazeel can return!');
                player.inventory.remove(ITEM_SCRIPT_OF_HAZEEL, 1);
                player.message('Alomone reads the script over Hazeel\'s grave...');
                player.message('A shadowy figure appears!');
                player.message('Lord Hazeel has returned!');
                player.inventory.add(ITEM_COINS, 2000);
                player.addQuestPoints(QUEST_POINTS);
                player.addExperience(3, 1500); // Thieving
                setQuestStage(player, -1);
                player.message('You have completed the Hazeel Cult quest (Evil Path)');
            } else {
                await npc.say('We need the script if Hazeel is to return.');
            }
        }
        return true;
    }

    // --- Butler Jones ---
    if (npc.id === NPC_BUTLER_JONES) {
        if (isEvil) {
            await npc.say('Hello friend. Keep up the good work.');
            if (stage === 5) {
                await npc.say('Have you found the sacred script?');
                await npc.say('It must be hidden in the house somewhere.');
            }
        } else if (isGood && stage >= 5) {
            await npc.say('You fool! Did you think you could accuse me?');
            await npc.say('Ceril trusts me completely.');
        }
        return true;
    }

    return true;
}

// ----------------------------------------
// Object Interactions
// ----------------------------------------

async function onOpLoc(player, object) {
    const stage = getQuestStage(player);
    const isGood = player.getCache('good_side');
    const isEvil = player.getCache('evil_side');

    // --- Butler's Cupboard (Good Path Proof) ---
    if ([OBJ_BUTLERS_CUPBOARD_OPEN, OBJ_BUTLERS_CUPBOARD_CLOSED].includes(object.id)) {
        player.message('You search the cupboard...');
        if (stage === 5 && isGood) {
            player.message('You find a bottle of poison and a strange amulet!');
            player.message('You show Ceril the evidence.');
            player.message('Ceril is shocked and has Butler Jones arrested!');
            player.inventory.add(ITEM_COINS, 2000);
            player.addQuestPoints(QUEST_POINTS);
            player.addExperience(3, 1500); // Thieving
            setQuestStage(player, -1);
            player.message('You have completed the Hazeel Cult quest (Good Path)');
        } else {
            player.message('But find nothing.');
        }
        return true;
    }

    // --- Basement Crate (Evil Path Key) ---
    if (object.id === OBJ_BASEMENT_CRATE) {
        player.message('You search the crate...');
        if (stage === 5 && isEvil && !player.inventory.has(ITEM_CARNILLEAN_KEY)) {
            player.message('You find an old rusty key!');
            player.inventory.add(ITEM_CARNILLEAN_KEY, 1);
        } else {
            player.message('But find nothing.');
        }
        return true;
    }

    // --- Bookcase (Evil Path Secret Passage) ---
    if (object.id === OBJ_BOOKCASE) {
        player.message('You search the bookcase...');
        if (stage === 5 && isEvil) {
            player.message('The shelves slide aside revealing a secret passage!');
            player.teleport(614, 2504); // Secret room
        } else {
            player.message('But find nothing interesting.');
        }
        return true;
    }

    // --- Chest (Evil Path Script) ---
    if (object.id === OBJ_CHEST_CLOSED) {
        player.message('The chest is locked.');
        return true;
    }

    return false;
}

// --- Using Key on Chest ---
async function onUseItemOnObject(player, item, object) {
    if (item.id === ITEM_CARNILLEAN_KEY && object.id === OBJ_CHEST_CLOSED) {
        player.message('You use the key to open the chest.');
        player.message('Inside you find the Sacred Script of Hazeel!');
        player.inventory.add(ITEM_SCRIPT_OF_HAZEEL, 1);
        if (getQuestStage(player) === 5) {
            setQuestStage(player, 6);
        }
        return true;
    }
    return false;
}

// ----------------------------------------
// Combat Events (Kill Triggers)
// ----------------------------------------

function onNpcKilled(player, npc) {
    if (npc.id === NPC_ALOMONE && player.getCache('good_side')) {
        if (!player.inventory.has(ITEM_CARNILLEAN_ARMOUR)) {
            player.message('You find the Carnillean family armour behind Alomone\'s corpse!');
            player.inventory.add(ITEM_CARNILLEAN_ARMOUR, 1);
            if (getQuestStage(player) === 3) {
                setQuestStage(player, 4);
            }
        }
    }
}

module.exports = {
    name: 'hazeel-cult',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    onUseItemOnObject,
    onNpcKilled,
    npcs: [NPC_CERIL, NPC_BUTLER_JONES, NPC_CLIVET, NPC_ALOMONE, NPC_CULT_MEMBER],
    objects: [OBJ_BUTLERS_CUPBOARD_OPEN, OBJ_BUTLERS_CUPBOARD_CLOSED, OBJ_BASEMENT_CRATE, OBJ_BOOKCASE, OBJ_CHEST_CLOSED]
};
