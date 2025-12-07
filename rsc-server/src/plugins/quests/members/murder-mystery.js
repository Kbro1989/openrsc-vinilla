const QUEST_NAME = 'Murder Mystery';
const QUEST_POINTS = 3;

// NPCs (from OpenRSC NpcId.java)
const NPC_GUARD = 680;
const NPC_POISON_SALESMAN = 681;
const NPC_ANNA = 662;
const NPC_BOB = 663;
const NPC_CAROL = 664;
const NPC_DAVID = 665;
const NPC_ELIZABETH = 666;
const NPC_FRANK = 667;
const NPC_HOBBES = 668;
const NPC_LOUISA = 669;
const NPC_STANFORD = 670;
const NPC_PIERRE = 671;
const NPC_DONOVAN = 672;
const NPC_MARY = 673;
const NPC_GOSSIP = 678;

// Items
const ITEM_COINS = 10;
const ITEM_THREAD_RED = 1161;
const ITEM_THREAD_GREEN = 1162;
const ITEM_THREAD_BLUE = 1163;
const ITEM_MURDER_DAGGER = 1164;
const ITEM_FLOUR = 136;
const ITEM_MURDER_POT = 1165;

// Sinclair family members and their thread colors
const SUSPECTS = {
    david: { npc: NPC_DAVID, threadColor: 'green', poisonUse: 'spiders nest upstairs' },
    anna: { npc: NPC_ANNA, threadColor: 'green', poisonUse: 'compost heap in garden' },
    carol: { npc: NPC_CAROL, threadColor: 'red', poisonUse: 'blocked drain outside' },
    bob: { npc: NPC_BOB, threadColor: 'red', poisonUse: 'beehive in garden' },
    frank: { npc: NPC_FRANK, threadColor: 'blue', poisonUse: 'family crest cleaning' },
    elizabeth: { npc: NPC_ELIZABETH, threadColor: 'blue', poisonUse: 'mosquito nest at fountain' }
};

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

function getMurderer(player) {
    return player.getCache('murder_suspect');
}

function setMurderer(player) {
    const suspects = Object.keys(SUSPECTS);
    const murderer = suspects[Math.floor(Math.random() * suspects.length)];
    player.setCache('murder_suspect', murderer);
    return murderer;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // Guard - Quest Start
    if (npc.id === NPC_GUARD) {
        if (stage === 0) {
            await npc.say('Lord Sinclair has been murdered!');
            await npc.say('We need help with the investigation.');
            const choice = await player.ask(['I\'ll help', 'Not interested'], true);
            if (choice === 0) {
                await npc.say('Look for clues around the mansion.');
                setQuestStage(player, 1);
                setMurderer(player);
            }
        } else if (stage === 1) {
            const hasThread = player.getCache('has_thread');
            const hasEvidence = player.getCache('has_evidence');
            const hasFingerprint = player.getCache('has_fingerprint');

            if (hasThread && hasEvidence && hasFingerprint) {
                const murderer = getMurderer(player);
                await npc.say('With all this evidence...');
                player.message(`You prove ${murderer} is the murderer.`);
                await npc.say('Excellent detective work!');
                player.inventory.add(ITEM_COINS, 2000);
                player.addQuestPoints(QUEST_POINTS);
                setQuestStage(player, -1);
                player.message('You have completed the Murder Mystery quest!');
            } else {
                await npc.say('Find thread from the window, check alibi stories, get fingerprints.');
            }
        } else if (stage === -1) {
            await npc.say('Thanks for solving the murder!');
        }
        return true;
    }

    // Sinclair Family Members
    const suspectEntry = Object.entries(SUSPECTS).find(([_, s]) => s.npc === npc.id);
    if (suspectEntry && stage === 1) {
        const [name, suspect] = suspectEntry;
        await npc.say('What do you want to know?');
        const choice = await player.ask([
            'Where were you during the murder?',
            'Why did you buy poison?'
        ], true);

        if (choice === 0) {
            await npc.say('I was somewhere around the mansion. Alone.');
        } else if (choice === 1) {
            await npc.say(`I used it for ${suspect.poisonUse}.`);
            const murderer = getMurderer(player);
            if (name === murderer) {
                player.setCache('has_evidence', true);
                player.message('This alibi seems suspicious...');
            }
        }
        return true;
    }

    // Poison Salesman in Seers Village
    if (npc.id === NPC_POISON_SALESMAN && stage === 1) {
        await npc.say('I sold poison to someone at the Sinclair Mansion.');
        await npc.say('Search around for evidence of who bought it.');
        return true;
    }

    return false;
}

async function onOpLoc(player, object) {
    const stage = getQuestStage(player);
    if (stage !== 1) return false;

    // Study window - find thread
    if (object.id === 455) {
        const murderer = getMurderer(player);
        const suspect = SUSPECTS[murderer];
        const threadId = suspect.threadColor === 'red' ? ITEM_THREAD_RED :
            suspect.threadColor === 'green' ? ITEM_THREAD_GREEN : ITEM_THREAD_BLUE;

        player.message('You find some thread caught on the window.');
        player.inventory.add(threadId, 1);
        player.setCache('has_thread', true);
        return true;
    }

    // Murder scene - get dagger
    if (object.id === 456) {
        player.message('You carefully examine the murder scene.');
        if (!player.inventory.has(ITEM_MURDER_DAGGER)) {
            player.inventory.add(ITEM_MURDER_DAGGER, 1);
            player.message('You take the silver dagger as evidence.');
        }
        return true;
    }

    return false;
}

async function onUseItemOnItem(player, item1, item2) {
    // Flour on dagger to get fingerprints
    if ((item1.id === ITEM_FLOUR && item2.id === ITEM_MURDER_DAGGER) ||
        (item2.id === ITEM_FLOUR && item1.id === ITEM_MURDER_DAGGER)) {
        player.message('You dust the dagger with flour to reveal fingerprints.');
        player.setCache('has_fingerprint', true);
        return true;
    }
    return false;
}

module.exports = {
    name: 'murder-mystery',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    onUseItemOnItem,
    npcs: [NPC_GUARD, NPC_POISON_SALESMAN, NPC_ANNA, NPC_BOB, NPC_CAROL, NPC_DAVID, NPC_ELIZABETH, NPC_FRANK],
    objects: [455, 456]
};
