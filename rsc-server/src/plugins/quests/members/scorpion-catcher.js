const QUEST_NAME = 'Scorpion Catcher';
const QUEST_POINTS = 1;

// NPCs
const NPC_THORMAC = 389;
const NPC_SEER = 185;
const NPC_SCORPION_TAVERLY = 390;
const NPC_SCORPION_BARBARIAN = 391;
const NPC_SCORPION_MONASTERY = 392;

// Items - Cage states track which scorpions collected
const ITEM_CAGE_EMPTY = 679;
const ITEM_CAGE_ONE = 686;     // Taverly
const ITEM_CAGE_TWO = 687;     // Barbarian  
const ITEM_CAGE_THREE = 688;   // Monastery
const ITEM_CAGE_ONE_TWO = 689;
const ITEM_CAGE_ONE_THREE = 690;
const ITEM_CAGE_TWO_THREE = 691;
const ITEM_CAGE_FULL = 692;
const ITEM_COINS = 10;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    if (npc.id === NPC_THORMAC) {
        if (stage === 0) {
            await npc.say('I\'ve lost my 3 pet kharid scorpions!');
            await npc.say('They escaped and are all over RuneScape.');
            const choice = await player.ask(['How do I catch them?', 'What\'s in it for me?'], true);
            if (choice === 0 || choice === 1) {
                await npc.say('Use this cage. The Seers can locate them.');
                await npc.say('I\'ll enchant your battlestaffs as reward!');
                player.inventory.add(ITEM_CAGE_EMPTY, 1);
                setQuestStage(player, 1);
            }
        } else if (stage === 1 || stage === 2) {
            if (player.inventory.has(ITEM_CAGE_FULL)) {
                player.inventory.remove(ITEM_CAGE_FULL, 1);
                await npc.say('My scorpions! Home at last!');
                player.addExperience('strength', 6625);
                player.addQuestPoints(QUEST_POINTS);
                setQuestStage(player, -1);
                player.message('You have completed Scorpion Catcher!');
            } else {
                await npc.say('The Seers north can help locate them.');
            }
        } else if (stage === -1) {
            await npc.say('Want me to enchant a battlestaff? 40,000 coins.');
        }
        return true;
    }

    if (npc.id === NPC_SEER) {
        if (stage === 1) {
            await npc.say('Let me look into my mirror...');
            player.message('The seer gazes into a small mirror.');
            await npc.say('First scorpion: Near spiders and coffins.');
            await npc.say('In a secret room behind a wall crack.');
            setQuestStage(player, 2);
        } else if (stage === 2) {
            // Check which scorpions still needed
            const hasOne = player.inventory.has(ITEM_CAGE_ONE) ||
                player.inventory.has(ITEM_CAGE_ONE_TWO) ||
                player.inventory.has(ITEM_CAGE_ONE_THREE) ||
                player.inventory.has(ITEM_CAGE_FULL);
            const hasTwo = player.inventory.has(ITEM_CAGE_TWO) ||
                player.inventory.has(ITEM_CAGE_ONE_TWO) ||
                player.inventory.has(ITEM_CAGE_TWO_THREE) ||
                player.inventory.has(ITEM_CAGE_FULL);

            if (!hasOne) {
                await npc.say('Scorpion near spiders/coffins in secret room.');
            } else if (!hasTwo) {
                await npc.say('Scorpion in barbarian village. Man in black has it.');
            } else {
                await npc.say('Last scorpion upstairs, brown clothing nearby.');
            }
        }
        return true;
    }

    return false;
}

async function onUseItemOnNPC(player, item, npc) {
    const stage = getQuestStage(player);
    if (stage !== 2) return false;

    const cageIds = [ITEM_CAGE_EMPTY, ITEM_CAGE_ONE, ITEM_CAGE_TWO, ITEM_CAGE_THREE,
        ITEM_CAGE_ONE_TWO, ITEM_CAGE_ONE_THREE, ITEM_CAGE_TWO_THREE];

    if (!cageIds.includes(item.id)) return false;

    let newCage = null;

    // Taverly scorpion
    if (npc.id === NPC_SCORPION_TAVERLY) {
        if (item.id === ITEM_CAGE_EMPTY) newCage = ITEM_CAGE_ONE;
        else if (item.id === ITEM_CAGE_TWO) newCage = ITEM_CAGE_ONE_TWO;
        else if (item.id === ITEM_CAGE_THREE) newCage = ITEM_CAGE_ONE_THREE;
        else if (item.id === ITEM_CAGE_TWO_THREE) newCage = ITEM_CAGE_FULL;
    }
    // Barbarian scorpion
    else if (npc.id === NPC_SCORPION_BARBARIAN) {
        if (item.id === ITEM_CAGE_EMPTY) newCage = ITEM_CAGE_TWO;
        else if (item.id === ITEM_CAGE_ONE) newCage = ITEM_CAGE_ONE_TWO;
        else if (item.id === ITEM_CAGE_THREE) newCage = ITEM_CAGE_TWO_THREE;
        else if (item.id === ITEM_CAGE_ONE_THREE) newCage = ITEM_CAGE_FULL;
    }
    // Monastery scorpion
    else if (npc.id === NPC_SCORPION_MONASTERY) {
        if (item.id === ITEM_CAGE_EMPTY) newCage = ITEM_CAGE_THREE;
        else if (item.id === ITEM_CAGE_ONE) newCage = ITEM_CAGE_ONE_THREE;
        else if (item.id === ITEM_CAGE_TWO) newCage = ITEM_CAGE_TWO_THREE;
        else if (item.id === ITEM_CAGE_ONE_TWO) newCage = ITEM_CAGE_FULL;
    }

    if (newCage) {
        player.inventory.remove(item.id, 1);
        player.inventory.add(newCage, 1);
        player.message('You catch a scorpion!');
        return true;
    }

    return false;
}

module.exports = {
    name: 'scorpion-catcher',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onUseItemOnNPC,
    npcs: [NPC_THORMAC, NPC_SEER, NPC_SCORPION_TAVERLY, NPC_SCORPION_BARBARIAN, NPC_SCORPION_MONASTERY]
};
