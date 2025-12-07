/**
 * Plague City Quest (Members)
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Talked to Edmond, agreed to help find Elena
 * 2 - Got into West Ardougne through sewer
 * 3 - Found Elena in plague house
 * 4 - Got Elena's key, freed her
 * -1 - Complete
 * 
 * Reward: 2425 Mining XP, 2 Quest Points, Ardougne teleport
 */

const QUEST_NAME = 'Plague City';
const QUEST_POINTS = 2;

// NPC IDs
const NPC_EDMOND = 342;
const NPC_ALRENA = 343;
const NPC_ELENA = 344;
const NPC_JETHICK = 345;
const NPC_MILLI = 346;
const NPC_TED = 347;
const NPC_BRAVEK = 348;

// Item IDs
const ITEM_GAS_MASK = 657;
const ITEM_PLAGUE_SAMPLE = 658;
const ITEM_DWELLBERRIES = 765;
const ITEM_ROPE = 237;
const ITEM_SPADE = 5;
const ITEM_BUCKET_WATER = 50;
const ITEM_PICTURE_ELENA = 659;
const ITEM_PLAGUE_KEY = 660;
const ITEM_HANGOVER_CURE = 771;
const ITEM_CHOCOLATE_DUST = 772;
const ITEM_MILK = 22;
const ITEM_CHOCOLATE_MILK = 770;
const ITEM_SNAPE_GRASS = 469;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    // Edmond - Quest giver
    if (npc.id === NPC_EDMOND) {
        if (stage === 0) {
            await npc.say('Hello adventurer');
            await npc.say('Please, you look like a sort who would help');
            await npc.say("My daughter Elena has gone missing");
            await npc.say("She went to West Ardougne to help the plague victims");
            await npc.say("But that was weeks ago, and I haven't heard from her since");

            const option = await player.ask([
                "I'll help you find her",
                "Sorry, I'm too busy"
            ], true);

            if (option === 0) {
                await player.say("I'll help you find her");
                await npc.say('Oh thank you so much!');
                await npc.say("You'll need to get into West Ardougne");
                await npc.say("The city is sealed because of the plague");
                await npc.say("Perhaps through the sewer would work");
                await npc.say("Speak to my wife Alrena, she may be able to help");
                setQuestStage(player, 1);
                player.message('You have started Plague City quest');
            }
        } else if (stage === 1) {
            await npc.say('Have you found Elena yet?');
            await player.say('Not yet, I am still trying to get into West Ardougne');
            await npc.say('Speak to my wife Alrena for supplies');
        } else if (stage >= 2 && stage < -1) {
            await npc.say('Any news of my daughter?');
            if (stage === 4) {
                await player.say('I found her! She was imprisoned in a plague house');
                await player.say('But I freed her, she should be home soon');
                await npc.say('Oh wonderful news! Thank you so much!');
                await npc.say('Please, take this reward');

                // Complete quest
                setQuestStage(player, -1);
                player.questPoints += QUEST_POINTS;
                player.addExperience('mining', 2425);
                player.message('Congratulations! You have completed Plague City!');
                player.message(`You gain ${QUEST_POINTS} Quest Points and 2425 Mining XP`);
            }
        } else if (stage === -1) {
            await npc.say('Thank you again for saving Elena');
            await npc.say('She tells me there is more going on in West Ardougne');
            await npc.say('Perhaps you could help investigate?');
            // This leads to Biohazard quest
        }
        return true;
    }

    // Alrena - Gives gas mask and picture
    if (npc.id === NPC_ALRENA) {
        if (stage >= 1) {
            if (!player.inventory.has(ITEM_GAS_MASK)) {
                await npc.say("Here, take this gas mask");
                await npc.say("You'll need it in the plague city");
                player.inventory.add(ITEM_GAS_MASK, 1);
                player.message('Alrena gives you a gas mask');
            }
            if (!player.inventory.has(ITEM_PICTURE_ELENA)) {
                await npc.say("And here's a picture of Elena");
                await npc.say("Show it to people, someone might recognize her");
                player.inventory.add(ITEM_PICTURE_ELENA, 1);
                player.message('Alrena gives you a picture of Elena');
            }
        }
        return true;
    }

    // Elena - Found in plague house
    if (npc.id === NPC_ELENA) {
        if (stage === 3) {
            await npc.say("Oh thank goodness! Someone has found me!");
            await npc.say("I'm Elena, I've been imprisoned here");
            await npc.say("They locked me up thinking I had the plague");
            await player.say("I'm here to rescue you");
            await player.say("Your father sent me");
            await npc.say("Oh wonderful! But the door is locked");
            await npc.say("You'll need to find the key");
            await npc.say("I think Bravek the city warder might have it");
        } else if (stage === 4) {
            await player.say("I've got the key!");
            await npc.say("Quickly, free me!");
            player.message('You unlock the door and free Elena');
            await npc.say("Thank you so much!");
            await npc.say("Tell my father I'm safe, I'll make my own way home");
            player.message('Go speak to Edmond to complete the quest');
        }
        return true;
    }

    // Jethick - Finding Elena
    if (npc.id === NPC_JETHICK) {
        if (stage >= 2 && stage <= 99) { // Available after entering West Ardougne
            await npc.say('Hello, we don\'t get many newcomers around here');
            const choice = await player.ask([
                'Hi, I\'m looking for a woman from East Ardougne',
                'So who\'s in charge here?'
            ], true);

            if (choice === 0) { // Looking for woman
                await npc.say('East Ardougnian women are easier to find in East Ardougne');
                await player.say('Yes a lady called Elena');
                await npc.say('What does she look like?');
                if (player.inventory.has(ITEM_PICTURE_ELENA)) {
                    player.message('You show the picture to Jethick');
                    await npc.say('Ah yes I recognise her');
                    await npc.say('I think she is staying over with the Rehnison family');
                    await npc.say('They live in the small timbered building at the far north side of town');
                    // In authentic this is where you get the book, but we'll stick to the info for now
                } else {
                    await player.say('Um brown hair, in her twenties');
                    await npc.say("Hmm that doesn't narrow it down a huge amount");
                }
            } else { // Who's in charge
                await npc.say('The city warder Bravek is in charge at the moment');
            }
        }
        return true;
    }

    // Bravek - Has the key
    if (npc.id === NPC_BRAVEK) {
        if (stage === 3) {
            await npc.say("Urgh, who are you? What do you want?");
            await npc.say("I have a terrible hangover");
            await player.say("I need the key to the plague house");
            await npc.say("What? The plague house?");
            await npc.say("That woman is dangerous, she might have the plague!");

            if (player.inventory.has(ITEM_HANGOVER_CURE)) {
                await player.say("I have a hangover cure here");
                player.inventory.remove(ITEM_HANGOVER_CURE, 1);
                await npc.say("Oh thank you, that's much better");
                await npc.say("Fine, here's the key. Just get out");
                player.inventory.add(ITEM_PLAGUE_KEY, 1);
                player.message('Bravek gives you the key');
                setQuestStage(player, 4);
            } else {
                await npc.say("Ugh, speak to me later when you have a hangover cure");
                // TODO: Give scruffy note logic here or via Jethick/Clerk
            }
        }
        return true;
    }

    return false;
}

// Soil Softening and Digging (Mud Patch)
function onUseItemOnObject(player, item, object) {
    const stage = getQuestStage(player);

    // Use rope on sewer grate (321)
    if (object.id === 321 && item.id === ITEM_ROPE) {
        if (stage >= 1) {
            player.inventory.remove(ITEM_ROPE, 1);
            player.message('You tie the rope to the sewer grate');
            player.message('You climb down into the sewer');
            player.teleport(500, 3500, true);
            if (stage === 1) {
                setQuestStage(player, 2);
            }
            return true;
        }
    }

    // Mud Patch (447)
    if (object.id === 447) {
        // Water Bucket
        if (item.id === ITEM_BUCKET_WATER) {
            let buckets = player.getCacheInt('soil_buckets') || 0;
            if (buckets >= 3) {
                player.message('The soil is soft enough to dig into');
                player.setCache('soil_soften', 1);
            } else {
                player.message('You pour the water onto the soil');
                player.message('The soil softens slightly');
                buckets++;
                player.setCache('soil_buckets', buckets);
            }
            player.inventory.remove(ITEM_BUCKET_WATER, 1);
            player.inventory.add(21, 1); // Empty Bucket
            return true;
        }
        // Spade
        if (item.id === ITEM_SPADE) {
            if (player.getCache('soil_soften') || stage >= 3) {
                player.message('You dig deep into the soft soil');
                player.message('Suddenly it crumbles away and you fall through!');
                player.teleport(621, 3414, false); // Sewer
                if (stage === 2) {
                    setQuestStage(player, 3);
                }
            } else {
                player.message('You dig the soil but the ground is rather hard');
            }
            return true;
        }
    }
    return false;
}

module.exports = {
    name: 'plague-city',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onUseItemOnObject,
    npcs: [NPC_EDMOND, NPC_ALRENA, NPC_ELENA, NPC_JETHICK, NPC_MILLI, NPC_TED, NPC_BRAVEK],
    objects: [321, 447] // sewer grate, mud patch
};
