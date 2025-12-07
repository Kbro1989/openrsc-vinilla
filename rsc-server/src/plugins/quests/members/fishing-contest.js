/**
 * Fishing Contest (Members) - MVP Implementation
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Got competition pass from Mountain Dwarf
 * 2 - Learned about red vine worms from Grandpa Jack
 * 3 - Won competition, have trophy
 * -1 - Complete (White Wolf Mountain shortcut unlocked)
 * 
 * Requirements: None (10 Fishing recommended)
 * Rewards: 1 QP, Fishing XP, White Wolf Mountain shortcut access
 * 
 * NOTE: Simplified MV - complex NPC dialogues (vampire, competition NPCs) deferred
 */

const QUEST_NAME = "Fishing Contest";
const QUEST_POINTS = 1;

// NPCs (from npcs.json)
const NPC_MOUNTAIN_DWARF = 300; // Line 11445 (~index 300)
const NPC_BONZO = 293; // Line 11207 (~index 293)
const NPC_GRANDPA_JACK = 296; // Estimate
const NPC_MORRIS = 295; // Gate guard estimate

// Items (from items.json)
const ITEM_FISHING_PASS = 741; // Line 9886
const ITEM_FISHING_TROPHY = 742; // Line 9899
const ITEM_RED_VINE_WORMS = 740; // Estimate
const ITEM_RAW_GIANT_CARP = 369; // Estimate
const ITEM_SPADE = 211;
const ITEM_FISHING_ROD = 377;
const ITEM_FISHING_BAIT = 622;

// Objects/Scenery
const OBJ_VINE_RED = 350; // Red vines for digging worms
const OBJ_FISHING_SPOT_CARP = 351; // Carp fishing spot (by pipes)
const OBJ_FISHING_SPOT_REGULAR = 352; // Regular spot (by tree)
const OBJ_CONTEST_GATE = 353; // Competition entrance gate
const OBJ_WWM_STAIRS = 354; // White Wolf Mountain stairs

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    // ==================== MOUNTAIN DWARF - QUEST START ====================
    if (npc.id === NPC_MOUNTAIN_DWARF) {
        if (stage === 0) {
            await npc.say("Hmmph what do you want");

            const option = await player.ask([
                "I was wondering what was down those stairs?",
                "I was just stopping to say hello"
            ], false);

            if (option === 0) {
                await player.say("I was just wondering what was down those stairs?");
                await npc.say("You can't go down there");

                const subOption = await player.ask([
                    "I didn't want to anyway",
                    "Why not?",
                    "I'm bigger than you let me by"
                ], false);

                if (subOption === 1) {
                    await player.say("Why not?");
                    await npc.say("This is the home of the mountain dwarves");
                    await npc.say("How would you like it if I wanted to take a short cut through your home");

                    const option3 = await player.ask([
                        "Ooh is this a short cut to somewhere",
                        "Oh sorry I hadn't realised it was private",
                        "If you were my friend I wouldn't mind it"
                    ], false);

                    if (option3 === 0) {
                        await player.say("Ooh is this a short cut to somewhere?");
                        await npc.say("Well it is easier to go this way");
                        await npc.say("Than through passes full of wolves");
                    } else if (option3 === 2) {
                        await player.say("If you were my friend I wouldn't mind");
                        await npc.say("Yes, but I don't even know you");

                        const option4 = await player.ask([
                            "Well lets be friends",
                            "You're a grumpy little man aren't you?"
                        ], false);

                        if (option4 === 0) {
                            await player.say("Well lets be friends");
                            await npc.say("I don't make friends easily");
                            await npc.say("People need to earn my trust first");

                            const option5 = await player.ask([
                                "And how am I meant to do that?",
                                "You're a grumpy little man aren't you?"
                            ], false);

                            if (option5 === 0) {
                                await player.say("And how am I meant to do that?");
                                await npc.say("My we are the persistent one aren't we");
                                await npc.say("Well there's a certain gold artifact we're after");
                                await npc.say("We dwarves are big fans of gold");
                                await npc.say("This artifact is the first prize at the Hemenster fishing competition");
                                await npc.say("Fortunately we have acquired a pass to enter that competition");
                                await npc.say("Unfortunately Dwarves don't make good fishermen");

                                const option6 = await player.ask([
                                    "Fortunately I'm alright at fishing",
                                    "I'm not much of a fisherman either"
                                ], false);

                                if (option6 === 0) {
                                    await player.say("Fortunately I'm alright at fishing");
                                    await npc.say("Okay I entrust you with our competition pass");
                                    await npc.say("Go to Hemenster and do us proud");
                                    player.inventory.add(ITEM_FISHING_PASS, 1);
                                    setQuestStage(player, 1);
                                } else {
                                    await player.say("I'm not much of a fisherman either");
                                    await npc.say("What good are you?");
                                }
                            }
                        }
                    }
                } else if (subOption === 2) {
                    await player.say("I'm bigger than you");
                    await player.say("Let me by");
                    await npc.say("Go away");
                    await npc.say("You're not going to bully your way in here");
                }
            } else {
                await player.say("I was just stopping to say hello");
                await npc.say("Hello then");
            }
        } else if (stage === 1 || stage === 2) {
            await npc.say("Have you won yet?");

            if (!player.inventory.has(ITEM_FISHING_PASS) && !player.cache.has('paid_contest_fee')) {
                const option = await player.ask([
                    "No I need another competition pass",
                    "No it takes preparation to win fishing competitions"
                ], false);

                if (option === 0) {
                    await player.say("I need another competition pass");
                    await npc.say("Hmm its a good job they sent us spares");
                    await npc.say("There you go");
                    player.inventory.add(ITEM_FISHING_PASS, 1);
                }
            } else {
                await player.say("No not yet");
            }
        } else if (stage === 3) {
            await npc.say("Have you won yet?");
            await player.say("Yes I have");
            await npc.say("Well done, so where is the trophy?");

            if (player.inventory.has(ITEM_FISHING_TROPHY)) {
                await player.say("I have it right here");
                player.message("You give the trophy to the dwarf");
                await player.delay(3);
                player.inventory.remove(ITEM_FISHING_TROPHY, 1);
                await npc.say("Okay we will let you in now");

                // Complete quest
                player.sendQuestComplete(QUEST_NAME);
            } else {
                await player.say("I don't have it with me");
            }
        } else if (stage === -1) {
            await npc.say("Welcome oh great fishing champion");
            await npc.say("Feel free to pop by any time");
        }
        return true;
    }

    // ==================== BONZO - COMPETITION ORGANIZER ====================
    if (npc.id === NPC_BONZO) {
        if (stage === -1) {
            await npc.say("Hello champ");
            await npc.say("So any hints on how to fish so well");
            await player.say("I think I'll keep them to myself");
        } else if (player.cache.paid_contest_fee) {
            // Already paid, in competition
            await npc.say("So how are you doing so far?");

            if (player.inventory.has(ITEM_RAW_GIANT_CARP)) {
                const option = await player.ask([
                    "I have this big fish, is it enough to win?",
                    "I think I might still be able to find a bigger fish"
                ], false);

                if (option === 0) {
                    await player.say("I have this big fish");
                    await player.say("Is it enough to win?");
                    await npc.say("Well we'll just wait till time is up");
                    player.message("You wait");
                    await player.delay(3);
                    await contestWinDialogue(player, npc);
                } else {
                    await npc.say("Ok, good luck");
                }
            } else {
                await player.say("I think I might still be able to find a bigger fish");
                await npc.say("Ok, good luck");
            }
        } else {
            // Not yet paid
            if (player.inventory.has(ITEM_FISHING_TROPHY)) {
                await npc.say("Hello champ");
                await npc.say("So any hints on how to fish so well");
                await player.say("I think I'll keep them to myself");
                return true;
            }

            await npc.say("Roll up, roll up");
            await npc.say("Enter the great Hemenster fishing competition");
            await npc.say("Only 5gp entrance fee");

            const option = await player.ask([
                "I'll give that a go then",
                "No thanks, I'll just watch the fun"
            ], false);

            if (option === 0) {
                await npc.say("Marvelous");

                if (player.inventory.hasCoins(5)) {
                    player.message("You pay Bonzo 5 coins");
                    player.inventory.removeCoins(5);
                    await npc.say("Ok we've got all the fishermen");
                    await npc.say("It's time to roll");
                    await npc.say("You fish in the spot by the oak tree");
                    player.message("Your fishing competition spot is beside the oak tree");
                    player.cache.paid_contest_fee = true;
                } else {
                    player.message("I don't have the 5gp though");
                    await player.delay(3);
                    await npc.say("No pay, no play");
                }
            }
        }
        return true;
    }

    // ==================== GRANDPA JACK - HINTS ====================
    if (npc.id === NPC_GRANDPA_JACK) {
        if (stage === 1 || stage === 2) {
            await npc.say("Hello young one"); await npc.say("Come to visit old Grandpa Jack?");
            await npc.say("I can tell ye stories for sure");
            await npc.say("I used to be the best fisherman these parts have seen");

            const option = await player.ask([
                "Tell me a story then",
                "Are you entering the fishing competition?",
                "Sorry I don't have time now"
            ], false);

            if (option === 1) {
                await npc.say("Ah the Hemenster fishing competition");
                await npc.say("I know all about that");
                await npc.say("I won that four years straight");
                await npc.say("I'm too old for that lark now though");

                const subOption = await player.ask([
                    "I don't suppose you could give me any hints?",
                    "That's less competition for me then"
                ], false);

                if (subOption === 0) {
                    await player.say("I don't suppose you could give me any hints?");
                    await npc.say("Well you sometimes get these really big fish");
                    await npc.say("In the water just by the outflow pipes");
                    await npc.say("Think they're some kind of carp");
                    await npc.say("Try to get a spot round there");
                    await npc.say("The best sort of bait for them is red vine worms");
                    await npc.say("I used to get those from McGruber's wood, north of here");
                    await npc.say("Dig around in the red vines up there");

                    if (stage === 1) {
                        setQuestStage(player, 2);
                    }
                }
            } else if (option === 0) {
                await npc.say("Well when I were a young man");
                await npc.say("We used to take fishing trips over to Catherby");
                await npc.say("The fishing over there - now that was something");
                await npc.say("I wasn't having the best of days");
                await npc.say("Then my net suddenly got really heavy");
                await npc.say("I pulled it up");
                await npc.say("To my amazement I'd caught this little chest thing");
                await npc.say("It contained a diamond the size of a radish");
                await npc.say("That's the best catch I've ever had!");
            }
        } else {
            await npc.say("Hello young one");
            await npc.say("Come to visit old Grandpa Jack?");
        }
        return true;
    }

    return false;
}

// Helper function for winning contest
async function contestWinDialogue(player, npc) {
    await npc.say("Okay folks times up");
    await npc.say("Lets see who caught the biggest fish");
    player.message("You hand over your catch");
    await player.delay(3);

    if (player.inventory.has(ITEM_RAW_GIANT_CARP)) {
        player.inventory.remove(ITEM_RAW_GIANT_CARP, 1);
        await npc.say("We have a new winner");
        await npc.say("The heroic looking person");
        await npc.say("Who was fishing by the pipes");
        await npc.say("Has caught the biggest carp");
        await npc.say("I've seen since Grandpa Jack used to compete");
        player.message("You are given the Hemenster fishing trophy");
        player.inventory.add(ITEM_FISHING_TROPHY, 1);
        setQuestStage(player, 3);
    } else {
        await npc.say("And the winner is...");
        await npc.say("The stranger in black");
    }

    player.cache.remove('paid_contest_fee');
    player.cache.remove('contest_catches');
}

// Use spade on red vines to get worms
async function onUseItemOnObject(player, item, object) {
    if (object.id === OBJ_VINE_RED && item.id === ITEM_SPADE) {
        player.message("You dig in amongst the vines");
        await player.delay(3);
        player.message("You find a red vine worm");
        await player.delay(3);
        player.inventory.add(ITEM_RED_VINE_WORMS, 1);
        return true;
    }
    return false;
}

// Fishing spots
async function onOperateObject(player, object, command) {
    const stage = getQuestStage(player);

    // Carp fishing spot (by pipes) - requires red vine worms
    if (object.id === OBJ_FISHING_SPOT_CARP && command === 'fish') {
        if (!player.cache.paid_contest_fee && stage !== -1) {
            player.message("You need to enter the competition first");
            return true;
        }

        if (player.skills[10] < 10) { // Fishing level
            player.message("You need at least level 10 fishing to lure these fish");
            return true;
        }

        if (!player.inventory.has(ITEM_FISHING_ROD)) {
            player.message("I don't have the equipment to catch a fish");
            return true;
        }

        if (player.inventory.has(ITEM_RED_VINE_WORMS)) {
            player.message("You catch a giant carp");
            player.inventory.remove(ITEM_RED_VINE_WORMS, 1);
            player.inventory.add(ITEM_RAW_GIANT_CARP, 1);
        } else if (player.inventory.has(ITEM_FISHING_BAIT)) {
            player.message("You catch a sardine");
            player.inventory.remove(ITEM_FISHING_BAIT, 1);
            // Add sardine
        } else {
            player.message("You have no bait to catch fish here");
        }
        return true;
    }

    // White Wolf Mountain stairs
    if (object.id === OBJ_WWM_STAIRS && command === 'climb-down') {
        if (stage === -1) {
            player.message("You go down the stairs");
            // Teleport to underground shortcut
            player.teleport(426, 3294, false);
        } else {
            // Mountain dwarf blocks
            player.message("The mountain dwarf won't let you pass");
        }
        return true;
    }

    return false;
}

// Quest reward
function handleReward(player) {
    player.message("Well done you have completed the fishing competition quest");

    // Fishing XP (bonus if level 24+)
    const baseXP = 2500;
    const bonusXP = player.skills[10] >= 24 ? 800 : 0;
    player.addExperience('fishing', (baseXP + bonusXP) * 4);

    player.questPoints += QUEST_POINTS;
}

module.exports = {
    name: 'fishing-contest',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onUseItemOnObject,
    onOperateObject,
    handleReward,
    npcs: [NPC_MOUNTAIN_DWARF, NPC_BONZO, NPC_GRANDPA_JACK],
    objects: [OBJ_VINE_RED, OBJ_FISHING_SPOT_CARP, OBJ_FISHING_SPOT_REGULAR, OBJ_WWM_STAIRS]
};
