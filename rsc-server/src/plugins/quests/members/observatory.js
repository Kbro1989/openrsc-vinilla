const QUEST_NAME = 'Observatory Quest';
const QUEST_POINTS = 2;

// NPCs
const NPC_PROFESSOR = 459;
const NPC_ASSISTANT = 458;
const NPC_GOBLIN_GUARD = 461;

// Items needed
const ITEM_PLANK = 135;
const ITEM_BRONZE_BAR = 169;
const ITEM_MOLTEN_GLASS = 623;
const ITEM_LENS_MOULD = 1067;
const ITEM_LENS = 1068;
const ITEM_KEEP_KEY = 1070;
const ITEM_COINS = 10;
const ITEM_WINE = 142;

// Constellation rewards
const CONSTELLATIONS = [
    { name: 'Virgo', reward: { type: 'xp', skill: 'defense' } },
    { name: 'Libra', reward: { type: 'item', id: 42, count: 3 } }, // Law runes
    { name: 'Gemini', reward: { type: 'item', id: 77, count: 1 } }, // Black 2h
    { name: 'Pisces', reward: { type: 'item', id: 367, count: 3 } }, // Tuna
    { name: 'Taurus', reward: { type: 'item', id: 486, count: 1 } }, // Super str
    { name: 'Aquarius', reward: { type: 'item', id: 33, count: 25 } }, // Water runes
    { name: 'Scorpio', reward: { type: 'item', id: 659, count: 1 } }, // Weapon poison
    { name: 'Aries', reward: { type: 'xp', skill: 'attack' } },
    { name: 'Sagittarius', reward: { type: 'item', id: 648, count: 1 } }, // Maple longbow
    { name: 'Leo', reward: { type: 'xp', skill: 'hits' } },
    { name: 'Capricorn', reward: { type: 'xp', skill: 'strength' } },
    { name: 'Cancer', reward: { type: 'item', id: 304, count: 1 } } // Emerald amulet
];

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    if (npc.id === NPC_PROFESSOR) {
        if (stage === 0) {
            await npc.say('My telescope is broken!');
            await npc.say('Goblins damaged it. I need parts replaced.');
            const choice = await player.ask(['I\'ll help repair it', 'Sorry, too busy'], true);
            if (choice === 0) {
                await npc.say('I need 3 planks, bronze bar, and a lens.');
                await npc.say('My assistant can help find them.');
                setQuestStage(player, 1);
            }
        } else if (stage === 1) {
            if (player.inventory.count(ITEM_PLANK) >= 3) {
                player.inventory.remove(ITEM_PLANK, 3);
                await npc.say('Planks received! Now bring bronze bar.');
                setQuestStage(player, 2);
            } else {
                await npc.say('I need 3 planks for the tripod.');
            }
        } else if (stage === 2) {
            if (player.inventory.has(ITEM_BRONZE_BAR)) {
                player.inventory.remove(ITEM_BRONZE_BAR, 1);
                await npc.say('Bronze received! Now I need molten glass.');
                setQuestStage(player, 3);
            } else {
                await npc.say('Bring me a bronze bar for the tube.');
            }
        } else if (stage === 3) {
            if (player.inventory.has(ITEM_MOLTEN_GLASS)) {
                await npc.say('Glass! But I need my lens mould to craft it.');
                await npc.say('The goblins may have hidden it.');
                setQuestStage(player, 4);
            } else {
                await npc.say('I need molten glass for the lens.');
            }
        } else if (stage === 4) {
            if (player.inventory.has(ITEM_LENS_MOULD)) {
                await npc.say('The mould! Now craft the lens with the glass.');
                setQuestStage(player, 5);
            } else {
                await npc.say('Find the lens mould. Goblins stole it.');
            }
        } else if (stage === 5) {
            if (player.inventory.has(ITEM_LENS)) {
                player.inventory.remove(ITEM_LENS, 1);
                await npc.say('The lens is complete! Meet me at the Observatory!');
                setQuestStage(player, 6);
            } else {
                await npc.say('Use the mould with glass to craft the lens.');
            }
        } else if (stage === 6) {
            await npc.say('Use the telescope to complete your observation!');
        } else if (stage === -1) {
            await npc.say('Thanks for repairing my telescope!');
        }
        return true;
    }

    if (npc.id === NPC_ASSISTANT) {
        if (stage >= 1 && stage <= 5) {
            await npc.say('Need help finding materials?');
            await npc.say('Planks: Barbarian Outpost. Bronze: Smelt tin+copper.');
            await npc.say('Glass: Use sand bucket on furnace with soda ash.');
        } else if (stage >= 6) {
            await npc.say('Here, have some wine for helping!');
            player.inventory.add(ITEM_WINE, 1);
        }
        return true;
    }

    if (npc.id === NPC_GOBLIN_GUARD) {
        await npc.say('Leave this place human!');
        // Start combat
        return true;
    }

    return false;
}

async function onOpLoc(player, object) {
    const stage = getQuestStage(player);

    // Telescope
    if (object.id === 925 && stage === 6) {
        player.message('You look through the telescope...');
        const constellation = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
        player.message(`You see the constellation ${constellation.name}!`);

        // Give crafting XP for repairing
        player.addExperience('crafting', 2125);

        // Give constellation reward
        if (constellation.reward.type === 'xp') {
            player.addExperience(constellation.reward.skill, 2125);
        } else {
            player.inventory.add(constellation.reward.id, constellation.reward.count);
        }

        // Always give uncut sapphire
        player.inventory.add(160, 1);

        player.addQuestPoints(QUEST_POINTS);
        setQuestStage(player, -1);
        player.message('You have completed the Observatory Quest!');
        return true;
    }

    // Sacks - lens mould location
    if (object.id === 927 && stage >= 4) {
        if (!player.inventory.has(ITEM_LENS_MOULD)) {
            player.message('You find a peculiar mould underneath!');
            player.inventory.add(ITEM_LENS_MOULD, 1);
        }
        return true;
    }

    return false;
}

module.exports = {
    name: 'observatory',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    npcs: [NPC_PROFESSOR, NPC_ASSISTANT, NPC_GOBLIN_GUARD],
    objects: [925, 927]
};
