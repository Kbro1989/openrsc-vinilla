const QUEST_NAME = 'Sea Slug';
const QUEST_POINTS = 1;

// NPCs
const NPC_CAROLINE = 574;
const NPC_HOLGART = 575;
const NPC_KENNITH = 576;
const NPC_KENT = 577;
const NPC_BAILEY = 578;
const NPC_FISHERMAN = 579;

// Items
const ITEM_SWAMP_PASTE = 988;
const ITEM_UNLIT_TORCH = 248;
const ITEM_LIT_TORCH = 249;
const ITEM_OYSTER_PEARLS = 1019;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    if (npc.id === NPC_CAROLINE) {
        if (stage === 0) {
            await npc.say('My husband and son are on a fishing platform.');
            await npc.say('I haven\'t heard from them in days!');
            const choice = await player.ask(['I\'ll investigate', 'Too busy'], true);
            if (choice === 0) {
                await npc.say('Thank you! Holgart can take you there.');
                setQuestStage(player, 1);
            }
        } else if (stage === 6) {
            await npc.say('You saved Kennith! Thank you!');
            player.inventory.add(ITEM_OYSTER_PEARLS, 1);
            player.addExperience('fishing', 7175);
            player.addQuestPoints(QUEST_POINTS);
            setQuestStage(player, -1);
            player.message('You have completed Sea Slug!');
        } else if (stage > 0 && stage < 6) {
            await npc.say('Please find my family!');
        }
        return true;
    }

    if (npc.id === NPC_HOLGART) {
        if (stage === 1) {
            await npc.say('My boat has holes. I need swamp paste to fix it.');
            await npc.say('Mix swamp tar with flour, heat on fire.');
            setQuestStage(player, 2);
        } else if (stage === 2) {
            if (player.inventory.has(ITEM_SWAMP_PASTE)) {
                player.inventory.remove(ITEM_SWAMP_PASTE, 1);
                await npc.say('Perfect! Boat is fixed. Jump aboard!');
                player.message('You arrive at the fishing platform.');
                setQuestStage(player, 3);
            } else {
                await npc.say('Get swamp paste from Lumbridge swamps.');
            }
        } else if (stage >= 3) {
            player.message('Holgart takes you to the platform.');
        }
        return true;
    }

    if (npc.id === NPC_KENNITH) {
        if (stage === 3) {
            await npc.say('I want my daddy! He left days ago.');
            await npc.say('The fishermen tried to throw us in the sea!');
            setQuestStage(player, 4);
        } else if (stage === 5) {
            if (player.getCache('loose_panel')) {
                await npc.say('I\'ll come out when you figure how to get me down!');
            } else {
                await npc.say('I won\'t go near those sea slugs!');
            }
        }
        return true;
    }

    if (npc.id === NPC_KENT) {
        if (stage === 4) {
            await npc.say('The sea slugs control minds!');
            player.message('Kent pulls a sea slug from your neck!');
            await npc.say('Get Kennith off that platform!');
            setQuestStage(player, 5);
        }
        return true;
    }

    if (npc.id === NPC_BAILEY) {
        if (stage === 5) {
            await npc.say('Sea slugs fear heat! Here, take this torch.');
            if (!player.inventory.has(ITEM_UNLIT_TORCH) && !player.inventory.has(ITEM_LIT_TORCH)) {
                player.inventory.add(ITEM_UNLIT_TORCH, 1);
            }
            await npc.say('Light it and the fishermen won\'t approach.');
            player.setCache('need_lit_torch', true);
        }
        return true;
    }

    if (npc.id === NPC_FISHERMAN) {
        await npc.say('Must find family... deep under the blue...');
        return true;
    }

    return false;
}

async function onOpBound(player, object) {
    // Loose panel
    if (object.id === 124 && getQuestStage(player) === 5) {
        player.message('You kick the rotten panel. It crumbles away.');
        player.setCache('loose_panel', true);
        return true;
    }
    return false;
}

async function onOpLoc(player, object) {
    // Crane to rescue Kennith
    if (object.id === 453 && getQuestStage(player) === 5 && player.getCache('loose_panel')) {
        player.message('Kennith climbs onto the fishing net.');
        player.message('You lower him to the rowboat below.');
        setQuestStage(player, 6);
        player.removeCache('loose_panel');
        return true;
    }
    return false;
}

module.exports = {
    name: 'sea-slug',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpBound,
    onOpLoc,
    npcs: [NPC_CAROLINE, NPC_HOLGART, NPC_KENNITH, NPC_KENT, NPC_BAILEY, NPC_FISHERMAN],
    objects: [453],
    wallObjects: [124]
};
