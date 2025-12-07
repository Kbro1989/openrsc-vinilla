/**
 * Biohazard Quest (Members)
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Elena asks to retrieve distillator, talk to Jerico
 * 2 - Talked to Jerico, ready to infiltrate HQ
 * 3 - Infiltrated HQ / Retrieved Distillator
 * 4 - Given Distillator to Elena, received Plague Sample
 * 5 - Given Sample to Chemist, received reagents
 * 6 - Delivered liquid honey to Chancy
 * 7 - Delivered sulphuric broline to Hops
 * 8 - Delivered ethenea to Da Vinci
 * 9 - Delivered all reagents, Chemist gives Touch Paper
 * 10 - Gathered all 3 samples from boys
 * 11 - Given samples to Guidor
 * -1 - Complete (Talk to King Lathas)
 */

const QUEST_NAME = 'Biohazard';
const QUEST_POINTS = 3;

// NPC IDs
const NPC_ELENA_HOUSE = 483;
const NPC_OMART = 484;
const NPC_JERICO = 486;
const NPC_KILRON = 487;
const NPC_NURSE_SARAH = 500;
const NPC_CHEMIST = 504;
const NPC_CHANCY = 505;
const NPC_HOPS = 506;
const NPC_DEVINCI = 507;
const NPC_GUIDOR = 508;
const NPC_CHANCY_BAR = 509;
const NPC_HOPS_BAR = 510;
const NPC_DEVINCI_BAR = 511;
const NPC_KING_LATHAS = 512;
const NPC_GUIDORS_WIFE = 488;

// Item IDs
const ITEM_PIGEON_CAGE = 798;
const ITEM_BIRD_FEED = 800;
const ITEM_ROTTEN_APPLES = 801;
const ITEM_DOCTORS_GOWN = 802;
const ITEM_BIOHAZARD_BRONZE_KEY = 803;
const ITEM_DISTILLATOR = 804;
const ITEM_PRIEST_ROBE = 807;
const ITEM_PRIEST_GOWN = 808;
const ITEM_LIQUID_HONEY = 809;
const ITEM_ETHENEA = 810;
const ITEM_SULPHURIC_BROLINE = 811;
const ITEM_PLAGUE_SAMPLE = 812;
const ITEM_TOUCH_PAPER = 813;
const ITEM_KING_LATHAS_AMULET = 826;

// Object IDs
const OBJ_ELENAS_DOOR = 152;
const OBJ_JERICOS_CUPBOARD_CLOSED = 56;
const OBJ_JERICOS_CUPBOARD_OPEN = 71;
const OBJ_GET_INTO_CRATES_GATE = 504;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    if (npc.id === NPC_ELENA_HOUSE) {
        if (stage === 0) {
            // Check pre-req: Plague City must be complete (-1)
            // Assuming simplified check: if questStages['Plague City'] !== -1
            if (player.questStages['Plague City'] !== -1 && player.questStages['Plague City'] !== 4) { // 4 is also common completion sentinel
                await npc.say("You must help me with the plague first.");
                return true;
            }

            await npc.say(`Hello ${player.username}, thank you for rescuing me.`);
            const choice = await player.options("So what's happening with the plague?", "Well, I'd better be going.");

            if (choice === 0) {
                await npc.say("That's the strange thing.");
                await npc.say("I've not seen any evidence of the plague at all.");
                await npc.say("I need to get my distillator back to test some samples.");
                await npc.say("But the mourners are still in my house.");
                await npc.say("Can you help me get it back?");

                const helpChoice = await player.options("I'll try running in and grabbing it.", "I'll try and distract them.");

                if (helpChoice === 0) {
                    await npc.say("No, they're too well armed. You'd never make it.");
                } else if (helpChoice === 1) {
                    await npc.say("Yes, that might work.");
                    await npc.say("Talk to my father Jerico, he might be able to help.");
                    setQuestStage(player, 1);
                }
            }
        } else if (stage === 1) {
            await npc.say("Have you retrieved my distillator yet?");
        } else if (stage >= 2) {
            if (player.inventory.has(ITEM_DISTILLATOR)) {
                await npc.say("Oh, wonderful! You found my distillator!");
                player.inventory.remove(ITEM_DISTILLATOR, 1);
                await npc.say("Now I can test these samples.");
                player.message("Elena tests the samples.");
                await npc.say("This is strange. These samples show no sign of the plague.");
                await npc.say("We need to get these results to my mentor Guidor in Varrock.");
                await npc.say("But the guards won't let us leave with them.");
                await npc.say("You'll have to find a way to smuggle them out.");
                player.inventory.add(ITEM_PLAGUE_SAMPLE, 1);
                setQuestStage(player, 4);
            } else {
                await npc.say("I thought you had my distillator?");
            }
        }
        return true;
    }

    if (npc.id === NPC_JERICO) {
        if (stage === 1) {
            await npc.say(`Hello ${player.username}.`);
            await npc.say("Elena tells me you're going to help us.");
            const choice = await player.options("Yes, I need to get into the mourner headquarters.", "I'm not sure what to do.");
            if (choice === 0) {
                await npc.say("Well, the mourners are fond of their food.");
                await npc.say("Perhaps if you could poison their stew?");
                await npc.say("I have some bird feed in the cupboard.");
                await npc.say("You could try mixing that with some rotten apples.");
                setQuestStage(player, 2);
            }
        }
        return true;
    }

    if (npc.id === NPC_OMART) {
        if (stage >= 1 && stage < 4) {
            await npc.say("I can help you cross the wall if the guards are distracted.");
            const choice = await player.options("I'm ready.", "Not yet.");
            if (choice === 0) {
                // Simplified check
                player.message("Omart helps you over the wall.");
                player.teleport(609, 574, false);
            }
        }
        return true;
    }

    if (npc.id === NPC_CHEMIST) {
        if (stage === 4) {
            await npc.say("What do you want?");
            const choice = await player.options("I have a plague sample for you to test.", "Nothing.");
            if (choice === 0) {
                await npc.say("A plague sample? I can't touch it!");
                await npc.say("But I can give you the reagents to test it yourself.");
                await npc.say("Give these to my errand boys going to Varrock.");
                await npc.say("Liquid Honey for Chancy, Sulphuric Broline for Hops, Ethenea for Da Vinci.");
                player.inventory.add(ITEM_LIQUID_HONEY, 1);
                player.inventory.add(ITEM_SULPHURIC_BROLINE, 1);
                player.inventory.add(ITEM_ETHENEA, 1);
                setQuestStage(player, 5);
            }
        } else if (stage >= 5 && stage < 9) {
            // Logic to check if reagents delivered
            await npc.say("Have you delivered the reagents?");
            // Simplification: assume player does it correctly or asks for more.
            if (!player.inventory.has(ITEM_LIQUID_HONEY) && !player.inventory.has(ITEM_SULPHURIC_BROLINE) && !player.inventory.has(ITEM_ETHENEA)) {
                // Assume delivered or lost
                // If using cache keys like 'vial_chancy', check here.
                // For now, allow proceeding if stage is advanced via boys.
            }
            if (stage === 8) { // Assuming 8 is all delivered
                await npc.say("Here is your touch paper.");
                player.inventory.add(ITEM_TOUCH_PAPER, 1);
                setQuestStage(player, 9);
            }
        }
        return true;
    }

    // Errand Boys Logic (Simplified)
    if (npc.id === NPC_CHANCY || npc.id === NPC_HOPS || npc.id === NPC_DEVINCI) {
        if (stage === 5 || stage === 6 || stage === 7) {
            await npc.say("Got anything for me?");
            const choice = await player.options("Liquid Honey", "Sulphuric Broline", "Ethenea");

            let item = -1;
            if (choice === 0) item = ITEM_LIQUID_HONEY;
            if (choice === 1) item = ITEM_SULPHURIC_BROLINE;
            if (choice === 2) item = ITEM_ETHENEA;

            if (player.inventory.has(item)) {
                player.inventory.remove(item, 1);
                await npc.say("Got it.");
                // Update stage logic simplistically
                let current = getQuestStage(player);
                if (current < 8) setQuestStage(player, current + 1);
            } else {
                await player.say("I don't have that.");
            }
        }
        return true;
    }

    // Bar Boys Logic (Retrieval)
    if (npc.id === NPC_CHANCY_BAR || npc.id === NPC_HOPS_BAR || npc.id === NPC_DEVINCI_BAR) {
        if (stage >= 9) {
            await npc.say("Here's your stuff.");
            // Give back items
            if (npc.id === NPC_CHANCY_BAR) player.inventory.add(ITEM_LIQUID_HONEY, 1);
            if (npc.id === NPC_HOPS_BAR) player.inventory.add(ITEM_SULPHURIC_BROLINE, 1);
            if (npc.id === NPC_DEVINCI_BAR) player.inventory.add(ITEM_ETHENEA, 1);

            // Increment stage till ready for Guidor
            let current = getQuestStage(player);
            if (current < 11) setQuestStage(player, current + 1);
        }
        return true;
    }

    if (npc.id === NPC_GUIDOR) {
        if (stage >= 11) { // Ready to analyze
            await npc.say("What do you want?");
            if (player.inventory.has(ITEM_PLAGUE_SAMPLE) &&
                player.inventory.has(ITEM_LIQUID_HONEY) &&
                player.inventory.has(ITEM_SULPHURIC_BROLINE) &&
                player.inventory.has(ITEM_ETHENEA) &&
                player.inventory.has(ITEM_TOUCH_PAPER)) {

                await player.say("I have the samples and reagents.");
                await npc.say("Let me see.");
                player.message("Guidor analyzes the samples.");
                await npc.say("This is a fake! There is no plague.");
                await npc.say("Tell King Lathas.");
                setQuestStage(player, -1); // Complete logic? Or wait for Lathas?
                // Authentic is: Talk to Guidor -> Stage Complete for part, then Lathas finishes quest.
                // Let's set to special stage 12
                setQuestStage(player, 12);
            }
        }
        return true;
    }

    if (npc.id === NPC_KING_LATHAS) {
        if (stage === 12) {
            await npc.say("You have news?");
            await player.say("The plague is a fake!");
            await npc.say("I knew it. Take this.");
            player.inventory.add(ITEM_KING_LATHAS_AMULET, 1);
            setQuestStage(player, -1);
            player.message("Quest Complete!");
        }
        return true;
    }

    return false;
}

async function onObjectAction(player, object) {
    if (object.id === OBJ_JERICOS_CUPBOARD_CLOSED) {
        player.message("You open the cupboard.");
        if (!player.inventory.has(ITEM_BIRD_FEED)) {
            player.inventory.add(ITEM_BIRD_FEED, 1);
            player.message("You find bird feed.");
        }
        return true;
    }
    return false;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    if (npc.id === NPC_ELENA_HOUSE) {
        if (stage === 0) {
            if (player.inventory.has(ITEM_DISTILLATOR)) {
                await npc.say("Oh, you already have my distillator!");
                player.inventory.remove(ITEM_DISTILLATOR, 1);
                await npc.say("Thank you so much!");
                setQuestStage(player, 2);
                return true;
            }

            await npc.say(`Hello ${player.username}, thank you for rescuing me.`);
            const choice = await player.options("So what's happening with the plague?", "Well, I'd better be going.");

            if (choice === 0) {
                await npc.say("That's the strange thing.");
                await npc.say("I've not seen any evidence of the plague at all.");
                await npc.say("I need to get my distillator back to test some samples.");
                await npc.say("But the mourners are still in my house.");
                await npc.say("Can you help me get it back?");

                const helpChoice = await player.options("I'll try running in and grabbing it.", "I'll try and distract them.");

                if (helpChoice === 0) {
                    await npc.say("No, they're too well armed. You'd never make it.");
                } else if (helpChoice === 1) {
                    await npc.say("Yes, that might work.");
                    await npc.say("Talk to my father Jerico, he might be able to help.");
                    setQuestStage(player, 1);
                }
            }
        } else if (stage === 1) {
            await npc.say("Have you retrieved my distillator yet?");
        } else if (stage >= 2) {
            if (player.inventory.has(ITEM_DISTILLATOR)) {
                await npc.say("Oh, wonderful! You found my distillator!");
                player.inventory.remove(ITEM_DISTILLATOR, 1);
                await npc.say("Now I can test these samples.");
                player.message("Elena tests the samples.");
                await npc.say("This is strange. These samples show no sign of the plague.");
                await npc.say("We need to get these results to my mentor Guidor in Varrock.");
                await npc.say("But the guards won't let us leave with them.");
                await npc.say("You'll have to find a way to smuggle them out.");
                player.inventory.add(ITEM_PLAGUE_SAMPLE, 1);
                setQuestStage(player, 4);
            } else {
                await npc.say("I thought you had my distillator?");
            }
        }
        return true;
    }

    if (npc.id === NPC_JERICO) {
        if (stage === 1) {
            await npc.say(`Hello ${player.username}.`);
            await npc.say("Elena tells me you're going to help us.");
            const choice = await player.options("Yes, I need to get into the mourner headquarters.", "I'm not sure what to do.");
            if (choice === 0) {
                await npc.say("Well, the mourners are fond of their food.");
                await npc.say("Perhaps if you could poison their stew?");
                await npc.say("I have some bird feed in the cupboard.");
                await npc.say("You could try mixing that with some rotten apples.");
                setQuestStage(player, 2);
            }
        }
        return true;
    }

    if (npc.id === NPC_OMART) {
        if (stage >= 1 && stage < 4) {
            await npc.say("I can help you cross the wall if the guards are distracted.");
            const choice = await player.options("I'm ready.", "Not yet.");
            if (choice === 0) {
                // Simplified check
                player.message("Omart helps you over the wall.");
                player.teleport(609, 574, false);
            }
        }
        return true;
    }

    if (npc.id === NPC_CHEMIST) {
        if (stage === 4) {
            await npc.say("What do you want?");
            const choice = await player.options("I have a plague sample for you to test.", "Nothing.");
            if (choice === 0) {
                await npc.say("A plague sample? I can't touch it!");
                await npc.say("But I can give you the reagents to test it yourself.");
                await npc.say("Give these to my errand boys going to Varrock.");
                await npc.say("Liquid Honey for Chancy, Sulphuric Broline for Hops, Ethenea for Da Vinci.");
                player.inventory.add(ITEM_LIQUID_HONEY, 1);
                player.inventory.add(ITEM_SULPHURIC_BROLINE, 1);
                player.inventory.add(ITEM_ETHENEA, 1);
                setQuestStage(player, 5);
            }
        } else if (stage >= 5 && stage < 9) {
            // Logic to check if reagents delivered
            await npc.say("Have you delivered the reagents?");
            // Simplification: assume player does it correctly or asks for more.
            if (!player.inventory.has(ITEM_LIQUID_HONEY) && !player.inventory.has(ITEM_SULPHURIC_BROLINE) && !player.inventory.has(ITEM_ETHENEA)) {
                // Assume delivered or lost
                // If using cache keys like 'vial_chancy', check here.
                // For now, allow proceeding if stage is advanced via boys.
            }
            if (stage === 8) { // Assuming 8 is all delivered
                await npc.say("Here is your touch paper.");
                player.inventory.add(ITEM_TOUCH_PAPER, 1);
                setQuestStage(player, 9);
            }
        }
        return true;
    }

    // Errand Boys Logic (Simplified)
    if (npc.id === NPC_CHANCY || npc.id === NPC_HOPS || npc.id === NPC_DEVINCI) {
        if (stage === 5 || stage === 6 || stage === 7) {
            await npc.say("Got anything for me?");
            const choice = await player.options("Liquid Honey", "Sulphuric Broline", "Ethenea");

            let item = -1;
            if (choice === 0) item = ITEM_LIQUID_HONEY;
            if (choice === 1) item = ITEM_SULPHURIC_BROLINE;
            if (choice === 2) item = ITEM_ETHENEA;

            if (player.inventory.has(item)) {
                player.inventory.remove(item, 1);
                await npc.say("Got it.");
                // Update stage logic simplistically
                let current = getQuestStage(player);
                if (current < 8) setQuestStage(player, current + 1);
            } else {
                await player.say("I don't have that.");
            }
        }
        return true;
    }

    // Bar Boys Logic (Retrieval)
    if (npc.id === NPC_CHANCY_BAR || npc.id === NPC_HOPS_BAR || npc.id === NPC_DEVINCI_BAR) {
        if (stage >= 9) {
            await npc.say("Here's your stuff.");
            // Give back items
            if (npc.id === NPC_CHANCY_BAR) player.inventory.add(ITEM_LIQUID_HONEY, 1);
            if (npc.id === NPC_HOPS_BAR) player.inventory.add(ITEM_SULPHURIC_BROLINE, 1);
            if (npc.id === NPC_DEVINCI_BAR) player.inventory.add(ITEM_ETHENEA, 1);

            // Increment stage till ready for Guidor
            let current = getQuestStage(player);
            if (current < 11) setQuestStage(player, current + 1);
        }
        return true;
    }

    if (npc.id === NPC_GUIDOR) {
        if (stage >= 11) { // Ready to analyze
            await npc.say("What do you want?");
            if (player.inventory.has(ITEM_PLAGUE_SAMPLE) &&
                player.inventory.has(ITEM_LIQUID_HONEY) &&
                player.inventory.has(ITEM_SULPHURIC_BROLINE) &&
                player.inventory.has(ITEM_ETHENEA) &&
                player.inventory.has(ITEM_TOUCH_PAPER)) {

                await player.say("I have the samples and reagents.");
                await npc.say("Let me see.");
                player.message("Guidor analyzes the samples.");
                await npc.say("This is a fake! There is no plague.");
                await npc.say("Tell King Lathas.");
                setQuestStage(player, -1); // Complete logic? Or wait for Lathas?
                // Authentic is: Talk to Guidor -> Stage Complete for part, then Lathas finishes quest.
                // Let's set to special stage 12
                setQuestStage(player, 12);
            }
        }
        return true;
    }

    if (npc.id === NPC_KING_LATHAS) {
        if (stage === 12) {
            await npc.say("You have news?");
            await player.say("The plague is a fake!");
            await npc.say("I knew it. Take this.");
            player.inventory.add(ITEM_KING_LATHAS_AMULET, 1);
            setQuestStage(player, -1);
            player.addQuestPoints(QUEST_POINTS);
            player.message('@gre@You haved gained ' + QUEST_POINTS + ' quest points!');
            player.message("Quest Complete!");
        }
        return true;
    }

    return false;
}

async function onObjectAction(player, object) {
    if (object.id === OBJ_JERICOS_CUPBOARD_CLOSED) {
        player.message("You open the cupboard.");
        if (!player.inventory.has(ITEM_BIRD_FEED)) {
            player.inventory.add(ITEM_BIRD_FEED, 1);
            player.message("You find bird feed.");
        }
        return true;
    }
    return false;
}


module.exports = {
    name: 'biohazard',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onObjectAction,
    npcs: [
        NPC_ELENA_HOUSE, NPC_OMART, NPC_JERICO, NPC_KILRON, NPC_NURSE_SARAH,
        NPC_CHEMIST, NPC_CHANCY, NPC_HOPS, NPC_DEVINCI, NPC_GUIDOR,
        NPC_CHANCY_BAR, NPC_HOPS_BAR, NPC_DEVINCI_BAR, NPC_KING_LATHAS, NPC_GUIDORS_WIFE
    ],
    objects: [OBJ_JERICOS_CUPBOARD_CLOSED, OBJ_ELENAS_DOOR, OBJ_GET_INTO_CRATES_GATE]
};
