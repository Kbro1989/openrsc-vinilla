/**
 * Tree Gnome Village Quest (Members)
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Talked to King Bolren, agreed to help recover orbs
 * 2 - Retrieved first orb from Khazard battlefield  
 * 3 - Retrieved second orb from Khazard warlord
 * 4 - Retrieved all orbs, returned to Bolren
 * -1 - Complete
 * 
 * Reward: 2 Quest Points, 11450 Attack XP, Gnome Amulet of Protection
 */

const QUEST_NAME = 'Tree Gnome Village';
const QUEST_POINTS = 2;

// NPC IDs
const NPC_KING_BOLREN = 392;
const NPC_COMMANDER_MONTAI = 393;
const NPC_TRACKER_1 = 394;
const NPC_TRACKER_2 = 395;
const NPC_TRACKER_3 = 396;
const NPC_KHAZARD_WARLORD = 397;
const NPC_ELKOY = 398;

// Item IDs
const ITEM_ORB_OF_PROTECTION = 674;
const ITEM_GNOME_AMULET = 675;
const ITEM_ORBS_OF_PROTECTION = 676; // All 3 orbs

// Object IDs
const OBJ_GNOME_MAZE = 350;
const OBJ_BATTLEFIELD = 351;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    // King Bolren
    if (npc.id === NPC_KING_BOLREN) {
        if (stage === 0) {
            await npc.say("Welcome human to the gnome village");
            await npc.say("I am King Bolren, leader of the gnomes");
            await npc.say("We are in desperate need of help!");

            const option = await player.ask([
                "What's wrong?",
                "Sorry, I'm too busy"
            ], true);

            if (option === 0) {
                await player.say("What's wrong?");
                await npc.say("The Khazard army has stolen our orbs of protection!");
                await npc.say("Without them, our village is vulnerable");
                await npc.say("The warlord Khazard seeks to destroy us");
                await npc.say("Will you help us recover the orbs?");

                const help = await player.ask([
                    "I'll help you recover them",
                    "I don't have time for this"
                ], true);

                if (help === 0) {
                    await player.say("I'll help you recover them");
                    await npc.say("Thank you brave adventurer!");
                    await npc.say("Speak to Commander Montai at the battlefield");
                    await npc.say("He can tell you where the orbs were taken");
                    setQuestStage(player, 1);
                    player.message("You have started Tree Gnome Village");
                }
            }
        } else if (stage >= 1 && stage < 4) {
            await npc.say("Have you recovered our orbs yet?");

            // Check for orbs
            if (player.inventory.has(ITEM_ORBS_OF_PROTECTION)) {
                await player.say("I have recovered all three orbs!");
                await npc.say("Wonderful! The village is saved!");
                await npc.say("Please, place them in the spirit tree");
                player.inventory.remove(ITEM_ORBS_OF_PROTECTION, 1);
                setQuestStage(player, 4);
            } else {
                await npc.say("Please hurry, the village is in danger!");
                await npc.say("Speak to Commander Montai at the battlefield");
            }
        } else if (stage === 4) {
            await npc.say("You have saved our village!");
            await npc.say("I knight you a friend of the gnomes!");
            await npc.say("Take this amulet as a token of our gratitude");

            player.inventory.add(ITEM_GNOME_AMULET, 1);
            player.message("King Bolren gives you a Gnome Amulet of Protection");

            // Complete quest
            setQuestStage(player, -1);
            player.questPoints += QUEST_POINTS;
            player.addExperience('attack', 11450 * 4);

            player.message("Congratulations! You have completed Tree Gnome Village!");
            player.message(`You gain ${QUEST_POINTS} Quest Points and 11450 Attack XP`);
        } else if (stage === -1) {
            await npc.say("Thank you again for saving our village, friend!");
            await npc.say("You are always welcome here");
        }
        return true;
    }

    // Commander Montai
    if (npc.id === NPC_COMMANDER_MONTAI) {
        if (stage >= 1) {
            await npc.say("Greetings warrior");
            await npc.say("We are fighting the Khazard army");
            await npc.say("They have taken our orbs to their bases");
            await npc.say("One is in the battlefield to the east");
            await npc.say("The warlord himself has another");
            await npc.say("We must retrieve them all!");

            if (stage === 1) {
                await npc.say("Search the battlefield for the first orb");
                await npc.say("Be careful of the Khazard soldiers!");
            }
        } else {
            await npc.say("Speak to King Bolren if you wish to help");
        }
        return true;
    }

    // Khazard Warlord
    if (npc.id === NPC_KHAZARD_WARLORD) {
        if (stage >= 2) {
            await npc.say("You dare challenge me, human?");
            await npc.say("The gnome orbs belong to Khazard now!");
            await npc.say("You will die for your insolence!");
            // Combat would be initiated
            player.message("The Khazard Warlord attacks you!");
        }
        return true;
    }

    // Elkoy - Guide through maze
    if (npc.id === NPC_ELKOY) {
        await npc.say("Hello friend!");

        const option = await player.ask([
            "Can you guide me through the maze?",
            "Goodbye"
        ], true);

        if (option === 0) {
            await npc.say("Of course! Follow me");
            player.message("Elkoy guides you through the maze");
            // Teleport to village center
            player.teleport(703, 3430, true);
        }
        return true;
    }

    return false;
}

// Search battlefield for orb
function onOperateObject(player, object) {
    if (object.id === OBJ_BATTLEFIELD) {
        const stage = getQuestStage(player);
        if (stage === 1) {
            player.message("You search the battlefield...");
            player.message("You find an Orb of Protection!");
            player.inventory.add(ITEM_ORB_OF_PROTECTION, 1);
            setQuestStage(player, 2);
            return true;
        }
    }
    return false;
}

// Kill Khazard Warlord for orb
function onKillNpc(player, npc) {
    if (npc.id === NPC_KHAZARD_WARLORD) {
        const stage = getQuestStage(player);
        if (stage === 2) {
            player.message("The Warlord drops the Orbs of Protection!");
            player.inventory.remove(ITEM_ORB_OF_PROTECTION, 1); // Remove single orb
            player.inventory.add(ITEM_ORBS_OF_PROTECTION, 1); // Add all orbs
            setQuestStage(player, 3);
        }
        return true;
    }
    return false;
}

module.exports = {
    name: 'tree-gnome-village',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onOperateObject,
    onKillNpc,
    npcs: [NPC_KING_BOLREN, NPC_COMMANDER_MONTAI, NPC_TRACKER_1, NPC_TRACKER_2, NPC_TRACKER_3, NPC_KHAZARD_WARLORD, NPC_ELKOY],
    objects: [OBJ_BATTLEFIELD]
};
