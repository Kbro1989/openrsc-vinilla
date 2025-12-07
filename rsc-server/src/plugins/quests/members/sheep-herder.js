const QUEST_NAME = 'Sheep Herder';
const QUEST_POINTS = 4;

// NPCs
const NPC_HALGRIVE = 552;
const NPC_FARMER_BRUMTY = 553;
const NPC_PLAGUE_SHEEP_1 = 554;
const NPC_PLAGUE_SHEEP_2 = 555;
const NPC_PLAGUE_SHEEP_3 = 556;
const NPC_PLAGUE_SHEEP_4 = 557;

// Items
const ITEM_CATTLE_PROD = 1000;
const ITEM_POISON_FEED = 1001;
const ITEM_PROTECTIVE_JACKET = 1002;
const ITEM_PROTECTIVE_TROUSERS = 1003;
const ITEM_SHEEP_REMAINS_1 = 1004;
const ITEM_SHEEP_REMAINS_2 = 1005;
const ITEM_SHEEP_REMAINS_3 = 1006;
const ITEM_SHEEP_REMAINS_4 = 1007;
const ITEM_COINS = 10;

// Enclosure bounds
const ENCLOSURE = { minX: 589, maxX: 592, minY: 543, maxY: 548 };

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

function isWearingProtection(player) {
    return player.equipment.has(ITEM_PROTECTIVE_JACKET) &&
        player.equipment.has(ITEM_PROTECTIVE_TROUSERS);
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    if (npc.id === NPC_HALGRIVE) {
        if (stage === 0) {
            await npc.say('A plague has spread to West Ardougne!');
            await npc.say('Four infected sheep escaped. They must be destroyed.');
            const choice = await player.ask(['I can do that', 'Not for me'], true);
            if (choice === 0) {
                await npc.say('Herd them to the enclosure, poison them, burn remains.');
                await npc.say('Get protective clothing from Doctor Orbon in the chapel.');
                player.inventory.add(ITEM_POISON_FEED, 1);
                setQuestStage(player, 1);
            }
        } else if (stage === 2) {
            const burnedAll = player.getCache('burned_sheep_1') &&
                player.getCache('burned_sheep_2') &&
                player.getCache('burned_sheep_3') &&
                player.getCache('burned_sheep_4');
            if (burnedAll) {
                await npc.say('All sheep disposed of! Here\'s your reward.');
                player.inventory.add(ITEM_COINS, 3100);
                player.addQuestPoints(QUEST_POINTS);
                setQuestStage(player, -1);
                player.message('You have completed Sheep Herder!');
            } else {
                await npc.say('All four sheep must be herded, killed, and burned.');
            }
        } else if (stage === -1) {
            await npc.say('Thank you for handling those sheep.');
        }
        return true;
    }

    if (npc.id === NPC_FARMER_BRUMTY) {
        if (stage === 2) {
            await npc.say('Use the cattle prod to herd sheep to enclosure.');
            await npc.say('Don\'t touch them without protection!');
        }
        return true;
    }

    return false;
}

async function onUseItemOnNPC(player, item, npc) {
    const stage = getQuestStage(player);
    if (stage < 1) return false;

    const sheepNpcs = [NPC_PLAGUE_SHEEP_1, NPC_PLAGUE_SHEEP_2, NPC_PLAGUE_SHEEP_3, NPC_PLAGUE_SHEEP_4];
    if (!sheepNpcs.includes(npc.id)) return false;

    // Using cattle prod
    if (item.id === ITEM_CATTLE_PROD) {
        if (!isWearingProtection(player)) {
            player.message('You need protective clothing!');
            return true;
        }
        player.message('You nudge the sheep forward.');
        player.message('Baaaaaa!!!');
        // In real implementation, move sheep toward enclosure
        if (stage === 1) setQuestStage(player, 2);
        return true;
    }

    // Using poison feed on sheep in enclosure
    if (item.id === ITEM_POISON_FEED) {
        // Check if sheep in enclosure bounds
        player.message('You give the sheep poisoned feed.');
        player.message('The sheep collapses and dies.');

        // Give remains based on which sheep
        const remainsMap = {
            [NPC_PLAGUE_SHEEP_1]: ITEM_SHEEP_REMAINS_1,
            [NPC_PLAGUE_SHEEP_2]: ITEM_SHEEP_REMAINS_2,
            [NPC_PLAGUE_SHEEP_3]: ITEM_SHEEP_REMAINS_3,
            [NPC_PLAGUE_SHEEP_4]: ITEM_SHEEP_REMAINS_4
        };
        player.inventory.add(remainsMap[npc.id], 1);
        return true;
    }

    return false;
}

async function onUseItemOnObject(player, item, object) {
    // Cattle furnace - burn remains
    if (object.id === 444) {
        const remainsItems = [ITEM_SHEEP_REMAINS_1, ITEM_SHEEP_REMAINS_2,
            ITEM_SHEEP_REMAINS_3, ITEM_SHEEP_REMAINS_4];
        const cacheKeys = ['burned_sheep_1', 'burned_sheep_2',
            'burned_sheep_3', 'burned_sheep_4'];

        const idx = remainsItems.indexOf(item.id);
        if (idx !== -1) {
            player.inventory.remove(item.id, 1);
            player.setCache(cacheKeys[idx], true);
            player.message('You burn the sheep remains to dust.');
            return true;
        }
    }
    return false;
}

module.exports = {
    name: 'sheep-herder',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onUseItemOnNPC,
    onUseItemOnObject,
    npcs: [NPC_HALGRIVE, NPC_FARMER_BRUMTY, NPC_PLAGUE_SHEEP_1, NPC_PLAGUE_SHEEP_2,
        NPC_PLAGUE_SHEEP_3, NPC_PLAGUE_SHEEP_4],
    objects: [443, 444]
};
