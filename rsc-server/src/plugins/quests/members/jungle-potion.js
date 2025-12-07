const QUEST_NAME = 'Jungle Potion';
const QUEST_POINTS = 1;

// NPC IDs (from OpenRSC NpcId.java)
const NPC_TRUFITUS = 771;

// Item IDs (from OpenRSC ItemId.java)
const ITEM_SNAKE_WEED = 975;
const ITEM_ARDRIGAL = 976;
const ITEM_SITO_FOIL = 977;
const ITEM_VOLENCIA_MOSS = 978;
const ITEM_ROGUES_PURSE = 979;

// Object IDs for herb locations
const OBJ_SNAKE_WEED_VINE = 709;
const OBJ_ARDRIGAL_PALM = 710;
const OBJ_SITO_FOIL_SCORCHED = 711;
const OBJ_VOLENCIA_MOSS_ROCK = 712;
const OBJ_ROGUES_PURSE_CAVE = 713;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== NPC_TRUFITUS) return false;

    const stage = getQuestStage(player);

    if (stage === 0) {
        await npc.say('Greetings Bwana, I am Trufitus Shakaya');
        await npc.say('I need to commune with the gods. You could help by collecting herbs.');
        const choice = await player.ask(['How can I help?', 'Sorry, too busy'], true);
        if (choice === 0) {
            await npc.say('Find "Snake Weed" - it grows where water kisses your feet');
            setQuestStage(player, 1);
        }
    } else if (stage === 1) {
        if (player.inventory.has(ITEM_SNAKE_WEED)) {
            player.inventory.remove(ITEM_SNAKE_WEED, 1);
            await npc.say('Next is "Ardrigal" - grows east near palms');
            setQuestStage(player, 2);
        } else {
            await npc.say('I need Snake Weed. Look in swampy areas.');
        }
    } else if (stage === 2) {
        if (player.inventory.has(ITEM_ARDRIGAL)) {
            player.inventory.remove(ITEM_ARDRIGAL, 1);
            await npc.say('Next is "Sito Foil" - grows where ground is blackened');
            setQuestStage(player, 3);
        } else {
            await npc.say('I need Ardrigal. Look near palm trees.');
        }
    } else if (stage === 3) {
        if (player.inventory.has(ITEM_SITO_FOIL)) {
            player.inventory.remove(ITEM_SITO_FOIL, 1);
            await npc.say('Next is "Volencia Moss" - clings to rocks');
            setQuestStage(player, 4);
        } else {
            await npc.say('I need Sito Foil. Search scorched earth.');
        }
    } else if (stage === 4) {
        if (player.inventory.has(ITEM_VOLENCIA_MOSS)) {
            player.inventory.remove(ITEM_VOLENCIA_MOSS, 1);
            await npc.say('Final herb is "Rogues Purse" - in the dark caves north');
            setQuestStage(player, 5);
        } else {
            await npc.say('I need Volencia Moss. Search rocky areas.');
        }
    } else if (stage === 5) {
        if (player.inventory.has(ITEM_ROGUES_PURSE)) {
            player.inventory.remove(ITEM_ROGUES_PURSE, 1);
            player.addQuestPoints(QUEST_POINTS);
            player.addExperience(15, 775); // Herblaw
            setQuestStage(player, -1);
            player.message('You have completed the Jungle Potion quest');
        } else {
            await npc.say('I need Rogues Purse. Search the northern caves.');
        }
    } else if (stage === -1) {
        await npc.say('Greetings Bwana! The gods are pleased!');
    }
    return true;
}

async function onOpLoc(player, object) {
    const stage = getQuestStage(player);
    const herbMap = {
        [OBJ_SNAKE_WEED_VINE]: { stage: 1, item: ITEM_SNAKE_WEED, name: 'Snake Weed' },
        [OBJ_ARDRIGAL_PALM]: { stage: 2, item: ITEM_ARDRIGAL, name: 'Ardrigal' },
        [OBJ_SITO_FOIL_SCORCHED]: { stage: 3, item: ITEM_SITO_FOIL, name: 'Sito Foil' },
        [OBJ_VOLENCIA_MOSS_ROCK]: { stage: 4, item: ITEM_VOLENCIA_MOSS, name: 'Volencia Moss' },
        [OBJ_ROGUES_PURSE_CAVE]: { stage: 5, item: ITEM_ROGUES_PURSE, name: 'Rogues Purse' }
    };

    const herb = herbMap[object.id];
    if (herb && stage >= herb.stage) {
        player.message('You search...');
        if (!player.inventory.has(herb.item)) {
            player.message(`You find some ${herb.name}!`);
            player.inventory.add(herb.item, 1);
        } else {
            player.message(`You already have ${herb.name}.`);
        }
        return true;
    }
    return false;
}

module.exports = {
    name: 'jungle-potion',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    npcs: [NPC_TRUFITUS],
    objects: [OBJ_SNAKE_WEED_VINE, OBJ_ARDRIGAL_PALM, OBJ_SITO_FOIL_SCORCHED, OBJ_VOLENCIA_MOSS_ROCK, OBJ_ROGUES_PURSE_CAVE]
};
