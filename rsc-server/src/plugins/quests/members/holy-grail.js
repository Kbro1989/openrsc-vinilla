const QUEST_NAME = 'Holy Grail';
const QUEST_POINTS = 2;

// Requires Merlin's Crystal completion
const REQ_QUEST = "Merlin's Crystal";

// NPCs
const NPC_KING_ARTHUR = 275;
const NPC_MERLIN = 393;
const NPC_BLACK_KNIGHT_TITAN = 370;
const NPC_FISHERMAN = 372;
const NPC_FISHER_KING = 373;
const NPC_SIR_PERCIVAL = 374;
const NPC_KING_PERCIVAL = 375;

// Items
const ITEM_EXCALIBUR = 400;
const ITEM_MAGIC_WHISTLE = 725;
const ITEM_BELL = 726;
const ITEM_MAGIC_FEATHER = 727;
const ITEM_HOLY_GRAIL = 728;
const ITEM_BIG_BONES = 413;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // King Arthur starts quest (handled with Merlin's Crystal checks)
    if (npc.id === NPC_KING_ARTHUR) {
        if (player.questStages[REQ_QUEST] !== -1) {
            await npc.say('Complete Merlin\'s Crystal first!');
            return true;
        }
        if (stage === 0) {
            await npc.say('I have another quest for you brave knight.');
            await npc.say('Seek the Holy Grail and return it to Camelot!');
            const choice = await player.ask(['I\'ll do it!', 'I\'m busy'], true);
            if (choice === 0) {
                await npc.say('Speak to Merlin in the library. He may help.');
                setQuestStage(player, 1);
            }
        } else if (stage === 6 && player.inventory.has(ITEM_HOLY_GRAIL)) {
            player.inventory.remove(ITEM_HOLY_GRAIL, 1);
            await npc.say('The Holy Grail! You have done well!');
            player.addExperience('prayer', 11000);
            player.addExperience('defense', 15300);
            player.addQuestPoints(QUEST_POINTS);
            setQuestStage(player, -1);
            player.message('You have completed the Holy Grail quest!');
        }
        return true;
    }

    // Merlin in library
    if (npc.id === NPC_MERLIN) {
        if (stage >= 1 && stage < 4) {
            await player.say('King Arthur sent me to find the Holy Grail.');
            await npc.say('The grail likely resides in a holy place.');
            await npc.say('Try speaking to Sir Galahad west of McGrubors Wood.');
            await npc.say('He returned from the quest knowing something...');
            if (stage === 1) setQuestStage(player, 2);
        } else if (stage === -1) {
            await npc.say('I\'m working on a spell to turn people into hedgehogs!');
        }
        return true;
    }

    // Black Knight Titan - requires Excalibur
    if (npc.id === NPC_BLACK_KNIGHT_TITAN) {
        await npc.say('I am the Black Knight Titan!');
        await npc.say('You must pass through me to continue!');
        const choice = await player.ask(['Have at ye, evil knight!', 'I\'ll run away'], true);
        if (choice === 0) {
            npc.setTarget(player);
        }
        return true;
    }

    // Fisherman - spawns bell
    if (npc.id === NPC_FISHERMAN) {
        await npc.say('Hi, I don\'t get many visitors here.');
        const choice = await player.ask(['Any idea how to enter the castle?', 'How\'s the fishing?'], true);
        if (choice === 0) {
            await npc.say('Just ring one of the bells outside.');
            await player.say('I didn\'t see any bells.');
            await npc.say('You must be blind then!');
            player.message('A bell appears near the castle entrance.');
            // Bell would spawn at entrance
        }
        return true;
    }

    // Fisher King
    if (npc.id === NPC_FISHER_KING) {
        await npc.say('You got inside at last!');
        if (stage === 3) setQuestStage(player, 4);
        await npc.say('I fear my life is running short.');
        await npc.say('Find my son Percival. He is a knight of the Round Table.');
        return true;
    }

    // Sir Percival - in sack at goblin village
    if (npc.id === NPC_SIR_PERCIVAL) {
        await npc.say('Thank you! I could hardly breathe!');
        const choice = await player.ask(['Your father wishes to see you', 'How did you end up in a sack?'], true);
        await player.say('Your father is the Fisher King. He wants you as heir.');
        if (player.inventory.has(ITEM_MAGIC_WHISTLE)) {
            player.message('You give a whistle to Sir Percival.');
            player.inventory.remove(ITEM_MAGIC_WHISTLE, 1);
            await npc.say('I will meet you there!');
            setQuestStage(player, 5);
        } else {
            await player.say('I will get you a whistle.');
        }
        return true;
    }

    // King Percival - after restoration
    if (npc.id === NPC_KING_PERCIVAL) {
        await npc.say('The land has been restored!');
        await npc.say('You may now take the Holy Grail!');
        setQuestStage(player, 6);
        return true;
    }

    return false;
}

async function onUseItemInv(player, item) {
    // Magic Whistle - teleport to Grail Castle
    if (item.id === ITEM_MAGIC_WHISTLE) {
        const stage = getQuestStage(player);
        // Check if at correct location (490-491, 652-653)
        const x = player.x;
        const y = player.y;
        if (x >= 490 && x <= 491 && y >= 652 && y <= 653) {
            if (stage === 5 || stage === -1) {
                player.teleport(492, 18); // Restored castle
            } else {
                player.teleport(396, 18); // Broken castle
            }
        } else {
            player.message('The whistle makes no noise here.');
        }
        return true;
    }

    // Bell - enter castle
    if (item.id === ITEM_BELL) {
        player.message('Ting a ling a ling!');
        // Check if near castle
        player.message('You are somehow inside the castle.');
        player.teleport(420, 35);
        return true;
    }

    return false;
}

async function onKillNpc(player, npc) {
    // Black Knight Titan - requires Excalibur
    if (npc.id === NPC_BLACK_KNIGHT_TITAN) {
        if (player.equipment.has(ITEM_EXCALIBUR)) {
            player.message('You have defeated the Black Knight Titan!');
            player.inventory.add(ITEM_BIG_BONES, 1);
            player.teleport(414, 11);
            return true;
        } else {
            player.message('Maybe you need something more to beat the titan...');
            // Titan respawns
            return true;
        }
    }
    return false;
}

async function onOpLoc(player, object) {
    // Sack containing Percival
    if (object.id === 408 && getQuestStage(player) === 4) {
        player.message('You hear muffled noises from the sack.');
        player.message('You open the sack.');
        // Percival NPC would spawn
        return true;
    }
    return false;
}

module.exports = {
    name: 'holy-grail',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    requirements: { quests: [REQ_QUEST] },
    onTalkToNPC,
    onUseItemInv,
    onKillNpc,
    onOpLoc,
    npcs: [NPC_KING_ARTHUR, NPC_MERLIN, NPC_BLACK_KNIGHT_TITAN, NPC_FISHERMAN,
        NPC_FISHER_KING, NPC_SIR_PERCIVAL, NPC_KING_PERCIVAL],
    objects: [408]
};
