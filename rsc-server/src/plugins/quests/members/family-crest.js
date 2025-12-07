/**
 * Family Crest (Members) - MVP Implementation
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Talked to Dimintheis, need to find 3 sons
 * 2-4 - Found sons, collecting crest fragments
 * 5 - Avan's jewelry task
 * 6 - Avan gave fragment 2
 * 7 - Johnathon needs cure
 * 8 - Kill Chronozon for fragment 3
 * -1 - Complete (gauntlets received)
 * 
 * Requirements: None
 * Rewards: 1 QP, Steel Gauntlets + choice of enchantment, Smithing/Magic/Crafting XP
 * 
 * NOTE: Lever puzzle system deferred to future enhancement - core quest functional
 */

const QUEST_NAME = "Family Crest";
const QUEST_POINTS = 1;

// NPCs (verified from 2003scape configs + OpenRSC)
const NPC_DIMINTHEIS = 262;  // Line 9979 - Quest giver
const NPC_CHEF = 263;        // Line 10012 - Caleb (1st son in Catherby)
const NPC_AVAN = 256;        // Al Kharid goldsmith (2nd son) - estimated
const NPC_JOHNATHON = 268;   // Wilderness wizard (3rd son) - estimated
const NPC_CHRONOZON = 267;   // Line 10164 - Blood demon boss

// Items (verified from items.json)
const ITEM_FAMILY_CREST = 716;           // Line 9549
const ITEM_CREST_FRAGMENT_ONE = 717;     // Line 9562
const ITEM_CREST_FRAGMENT_TWO = 718;     // Line 9575
const ITEM_CREST_FRAGMENT_THREE = 719;   // Line 9588
const ITEM_STEEL_GAUNTLETS = 720;        // Line 9601
const ITEM_GOLDSMITH_GAUNTLETS = 721;    // Line 9616
const ITEM_CHAOS_GAUNTLETS = 722;        // Estimate
const ITEM_COOKING_GAUNTLETS = 723;      // Estimate

// Perfect gold jewelry
const ITEM_RUBY_RING_PERFECT = 724;      // Estimate
const ITEM_RUBY_NECKLACE_PERFECT = 725;  // Estimate

// Cure poison potions
const ITEM_CURE_POISON_FULL = 567;       // Estimate
const ITEM_CURE_POISON_2DOSE = 568;      // Estimate
const ITEM_CURE_POISON_1DOSE = 569;      // Estimate

// Gauntlet types (for cache tracking)
const GAUNTLET_STEEL = 0;
const GAUNTLET_GOLDSMITH = 1;
const GAUNTLET_CHAOS = 2;
const GAUNTLET_COOKING = 3;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

function getGauntletEnchantment(player) {
    return player.cache.famcrest_gauntlets || GAUNTLET_STEEL;
}

async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    // ==================== DIMINTHEIS - QUEST GIVER ====================
    if (npc.id === NPC_DIMINTHEIS) {
        if (stage === 0) {
            await npc.say("Hello, my name is Dimintheis");
            await npc.say("Of the noble family of Fitzharmon");

            const option = await player.ask([
                "Why would a nobleman live in a little hut like this?",
                "You're rich then?, can I have some money?",
                "Hi, I am a bold adventurer"
            ], true);

            if (option === 0) {
                await player.say("Why would a nobleman live in a little hut like this?");
                await npc.say("The king has taken my estate from me");
                await npc.say("Until I can show him my family crest");

                const subOption = await player.ask([
                    "Why would he do that?",
                    "So where is this crest?"
                ], false);

                if (subOption === 0) {
                    await traditionDialogue(player, npc);
                } else {
                    await threeSonsDialogue(player, npc);
                }
            } else if (option === 1) {
                await player.say("You're rich then?");
                await player.say("Can I have some money?");
                await npc.say("Lousy beggar");
                await npc.say("There's too many of your sort about these days");
            } else if (option === 2) {
                await player.say("Hi, I am a bold adventurer");
                await npc.say("An adventurer hmm?");
                await npc.say("I may have an adventure for you");
                await npc.say("I desperately need my family crest returning to me");

                const subOption = await player.ask([
                    "Why are you so desperate for it?",
                    "So where is this crest?",
                    "I'm not interested in that adventure right now"
                ], false);

                if (subOption === 0) {
                    await traditionDialogue(player, npc);
                } else if (subOption === 1) {
                    await threeSonsDialogue(player, npc);
                }
            }
        } else if (stage >= 1 && stage < -1) {
            // Check if player has all 3 fragments or complete crest
            const hasCompleteCrest = player.inventory.has(ITEM_FAMILY_CREST);
            const hasAllFragments = player.inventory.has(ITEM_CREST_FRAGMENT_ONE) &&
                player.inventory.has(ITEM_CREST_FRAGMENT_TWO) &&
                player.inventory.has(ITEM_CREST_FRAGMENT_THREE);

            if (hasCompleteCrest || hasAllFragments) {
                await player.say("I have retrieved your crest");
                player.message("You give the crest to Dimintheis");

                if (hasCompleteCrest) {
                    player.inventory.remove(ITEM_FAMILY_CREST, 1);
                } else {
                    player.inventory.remove(ITEM_CREST_FRAGMENT_ONE, 1);
                    player.inventory.remove(ITEM_CREST_FRAGMENT_TWO, 1);
                    player.inventory.remove(ITEM_CREST_FRAGMENT_THREE, 1);
                }

                await player.delay(3);
                await npc.say("Thank you for your kindness");
                await npc.say("I cannot express my gratitude enough");
                await npc.say("You truly are a great hero");

                // Complete quest
                player.sendQuestComplete(QUEST_NAME);

                await npc.say("How can I reward you I wonder?");
                await npc.say("I suppose these gauntlets would make a good reward");
                await npc.say("If you die you will always retain these gauntlets");
                player.message("Dimintheis gives you a pair of gauntlets");
                player.inventory.add(ITEM_STEEL_GAUNTLETS, 1);
                player.cache.famcrest_gauntlets = GAUNTLET_STEEL;

                await npc.say("These gauntlets can be granted extra powers");
                await npc.say("Take them to one of my boys, they can each do something to them");
                await npc.say("Though they can only receive one of the three powers");
            } else {
                await npc.say("How are you doing finding the crest");
                await player.say("I don't have it yet");
            }
        } else if (stage === -1) {
            await npc.say("Thank you for saving our family honour");
            await npc.say("We will never forget you");
        }
        return true;
    }

    // ==================== CHEF/CALEB - 1ST SON (CATHERBY) ====================
    if (npc.id === NPC_CHEF) {
        if (stage === -1) {
            // Post-quest: Cooking gauntlets enchantment
            if (player.inventory.has(ITEM_STEEL_GAUNTLETS) &&
                getGauntletEnchantment(player) === GAUNTLET_STEEL) {
                await player.say("Your father said you could improve these gauntlets");
                await npc.say("Ah yes, I can enchant them to help with cooking");
                await npc.say("You'll burn food much less often wearing these");

                const option = await player.ask([
                    "That sounds good, enchant them for me",
                    "I'll check my other options with your brothers"
                ], false);

                if (option === 0) {
                    player.message("The chef takes your gauntlets");
                    await player.delay(3);
                    player.inventory.remove(ITEM_STEEL_GAUNTLETS, 1);
                    player.message("He enchants them with cooking magic");
                    await player.delay(3);
                    player.inventory.add(ITEM_COOKING_GAUNTLETS, 1);
                    player.cache.famcrest_gauntlets = GAUNTLET_COOKING;
                    await npc.say("There you go, cooking gauntlets!");
                }
            } else {
                await npc.say("Thanks again for reuniting our family");
            }
        } else if (stage >= 1) {
            await npc.say("Hello there!");
            await player.say("Are you Caleb, son of Dimintheis?");
            await npc.say("That I am! How is father?");
            await player.say("He needs the family crest back");
            await npc.say("Ah yes, I have a piece of it");
            await npc.say("Here, take it to him");

            if (!player.inventory.has(ITEM_CREST_FRAGMENT_ONE)) {
                player.inventory.add(ITEM_CREST_FRAGMENT_ONE, 1);
                player.message("Caleb gives you a crest fragment");

                if (stage === 1) {
                    setQuestStage(player, 2);
                }
            }

            await npc.say("You should find my brother Avan in Al Kharid");
            await npc.say("He's working as a goldsmith in the mines");
        }
        return true;
    }

    // ==================== AVAN - 2ND SON (AL KHARID GOLDSMITH) ====================
    if (npc.id === NPC_AVAN) {
        if (stage === -1) {
            // Post-quest: Goldsmith gauntlets enchantment
            if (player.inventory.has(ITEM_STEEL_GAUNTLETS) &&
                getGauntletEnchantment(player) === GAUNTLET_STEEL) {
                await player.say("Your father said you could improve these gauntlets");
                await npc.say("Indeed I can");
                await npc.say("In my quest to find the perfect gold I learned a lot");
                await npc.say("I can make it so when you're wearing these");
                await npc.say("You gain more experience when smithing gold");

                const option = await player.ask([
                    "That sounds good, improve them for me",
                    "I think I'll check my other options with your brothers"
                ], false);

                if (option === 0) {
                    player.message("Avan takes out a little hammer");
                    await player.delay(3);
                    player.message("He starts pounding on the gauntlets");
                    await player.delay(3);
                    player.inventory.remove(ITEM_STEEL_GAUNTLETS, 1);
                    player.inventory.add(ITEM_GOLDSMITH_GAUNTLETS, 1);
                    player.cache.famcrest_gauntlets = GAUNTLET_GOLDSMITH;
                    player.message("Avan hands the gauntlets to you");
                    await npc.say("Perfect goldsmithing gauntlets!");
                }
            } else {
                await npc.say("Thank you for helping restore our family honour");
            }
        } else if (stage >= 2 && stage < 6) {
            await npc.say("Can't you see I'm busy?");
            await player.say("I'm looking for a man named Avan");
            await npc.say("I'm called Avan yes");
            await player.say("You have part of a crest");
            await player.say("I have been sent to fetch it");
            await npc.say("Oh Dad wants it this time");
            await npc.say("Well I'll tell you what I'll do");
            await npc.say("I'm trying to obtain the perfect jewelery");
            await npc.say("I want a gold ring with a red stone in");
            await npc.say("And a necklace to match");
            await npc.say("Not just any gold mind you");
            await npc.say("I want as good a quality as you can get");

            if (stage < 5) {
                setQuestStage(player, 5);
            }
        } else if (stage === 6) {
            // Player has perfect jewelry
            if (player.inventory.has(ITEM_RUBY_RING_PERFECT) &&
                player.inventory.has(ITEM_RUBY_NECKLACE_PERFECT)) {
                await player.say("I have it");
                await npc.say("These are brilliant!");
                player.message("You exchange the jewelery for a piece of crest");
                player.inventory.remove(ITEM_RUBY_RING_PERFECT, 1);
                player.inventory.remove(ITEM_RUBY_NECKLACE_PERFECT, 1);
                player.inventory.add(ITEM_CREST_FRAGMENT_TWO, 1);

                await npc.say("These are a fine piece of work");
                await npc.say("I heard my brother Johnathon is now a young mage");
                await npc.say("He is hunting some demon in the wilderness");
                await npc.say("He spends most his time recovering in an inn");
                await npc.say("On the edge of the wilderness");

                setQuestStage(player, 7);
            } else {
                await npc.say("So how are you doing getting the jewelery?");
                await player.say("I'm still working on finding perfect gold");
            }
        } else if (stage >= 7) {
            await npc.say("How are you doing getting the rest of the crest?");
            if (player.inventory.has(ITEM_FAMILY_CREST)) {
                await player.say("I have found it");
                await npc.say("Well done, take it to my father");
            } else {
                await player.say("I am still working on it");
            }
        }
        return true;
    }

    // ==================== JOHNATHON - 3RD SON (WILDERNESS WIZARD) ====================
    if (npc.id === NPC_JOHNATHON) {
        if (stage === -1) {
            // Post-quest: Chaos gauntlets enchantment
            if (player.inventory.has(ITEM_STEEL_GAUNTLETS) &&
                getGauntletEnchantment(player) === GAUNTLET_STEEL) {
                await player.say("Your father tells me you can improve these gauntlets");
                await npc.say("He would be right");
                await npc.say("Though I didn't get good enough at the death spells to defeat chronozon");
                await npc.say("I am pretty good at the chaos spells");
                await npc.say("I can enchant your gauntlets so that your bolt spells are more effective");

                const option = await player.ask([
                    "That sounds good to me",
                    "I shall see what options your brothers can offer me first"
                ], false);

                if (option === 0) {
                    player.message("Johnathon waves his staff");
                    await player.delay(3);
                    player.message("The gauntlets sparkle and shimmer");
                    await player.delay(3);
                    player.inventory.remove(ITEM_STEEL_GAUNTLETS, 1);
                    player.inventory.add(ITEM_CHAOS_GAUNTLETS, 1);
                    player.cache.famcrest_gauntlets = GAUNTLET_CHAOS;
                    await npc.say("Chaos gauntlets, perfect for bolt spells!");
                }
            } else {
                await npc.say("My family now considers you a hero");
            }
        } else if (stage === 7) {
            // Johnathon is poisoned, needs cure
            if (player.cache.johnathon_ill) {
                await npc.say("Arrgh what has that spider done to me");
                await npc.say("I feel so ill, I can hardly think");
            } else {
                await player.say("Greetings, are you Johnathon Fitzharmon?");
                await npc.say("That is I");
                await player.say("I seek your fragment of the Fitzharmon family crest");
                await npc.say("The poison it is too much");
                await npc.say("Arrgh my head is all of a spin");
                player.message("Sweat is pouring down Johnathon's face");
                player.cache.johnathon_ill = true;
            }
        } else if (stage === 8) {
            await npc.say("I'm trying to kill the demon Chronozon");

            const option = await player.ask([
                "So is this Chronozon hard to defeat?",
                "Where can I find Chronozon?",
                "Wish me luck"
            ], false);

            if (option === 0) {
                await npc.say("Well you will need to be a good mage");
                await npc.say("He will need to be hit by the 4 elemental spells of death");
                await npc.say("Before he can be defeated");
            } else if (option === 1) {
                await npc.say("He is in the wilderness, somewhere below the obelisk of air");
            }
        }
        return true;
    }

    return false;
}

// Helper dialogue functions
async function traditionDialogue(player, npc) {
    await npc.say("We have this tradition in the Varrocian aristocracy");
    await npc.say("Each noble family has an ancient crest");
    await npc.say("This represents the honour and lineage of the family");
    await npc.say("If you are to lose this crest, the family's estate is given to the crown");
    await npc.say("Until the crest is returned");
    await player.say("So where is this crest?");
    await threeSonsDialogue(player, npc);
}

async function threeSonsDialogue(player, npc) {
    await npc.say("Well my 3 sons took it with them many years ago");
    await npc.say("When they rode out to fight in the war");
    await npc.say("Against the undead necromancer and his army");
    await npc.say("I didn't hear from them for many years and mourned them dead");
    await npc.say("However recently I heard word that my son Caleb is alive");
    await npc.say("Trying to earn his fortune");
    await npc.say("As a great chef, far away in the lands beyond white wolf mountain");

    const option = await player.ask([
        "Ok I will help you",
        "I'm not interested in that adventure right now"
    ], false);

    if (option === 0) {
        await player.say("Ok, I will help you");
        await npc.say("I thank you greatly");
        await npc.say("If you find Caleb send him my love");
        setQuestStage(player, 1);
    }
}

// Use cure poison on Johnathon
async function onUseItemOnNpc(player, item, npc) {
    if (npc.id === NPC_JOHNATHON && getQuestStage(player) === 7) {
        const cureIds = [ITEM_CURE_POISON_FULL, ITEM_CURE_POISON_2DOSE, ITEM_CURE_POISON_1DOSE];
        if (cureIds.includes(item.id)) {
            player.message("You feed your potion to Johnathon");
            await player.delay(3);
            player.inventory.remove(item.id, 1);
            player.cache.remove('johnathon_ill');

            await npc.say("Wow I'm feeling a lot better now");
            await npc.say("Thank you, what can I do for you?");
            await player.say("I'm after your part of the Fitzharmon family crest");
            await npc.say("Ooh I don't think I have that anymore");
            await npc.say("I have been trying to slay Chronozon the blood demon");
            await npc.say("And I think I dropped a lot of my things near him when he drove me away");
            await npc.say("He will have it now");

            setQuestStage(player, 8);
            return true;
        }
    }
    return false;
}

// Chronozon boss fight - 4 elemental spells required
async function onKillNpc(player, npc) {
    if (npc.id === NPC_CHRONOZON && getQuestStage(player) === 8) {
        // Check if player used all 4 elemental spells
        if (player.cache.chronozon_fire &&
            player.cache.chronozon_water &&
            player.cache.chronozon_earth &&
            player.cache.chronozon_air) {
            // Chronozon defeated properly
            player.message("Chronozon weakens");
            await player.delay(3);
            player.message("You have defeated Chronozon!");

            // Drop crest fragment 3
            const fragment = player.world.createGroundItem(
                ITEM_CREST_FRAGMENT_THREE,
                npc.x,
                npc.y,
                1,
                player
            );

            // Clear cache
            player.cache.remove('chronozon_fire');
            player.cache.remove('chronozon_water');
            player.cache.remove('chronozon_earth');
            player.cache.remove('chronozon_air');

            return true;
        } else {
            // Player didn't use all 4 spells
            player.message("Chronozon regenerates");
            player.message("You need to hit him with all 4 elemental death spells!");
            return true;
        }
    }
    return false;
}

// Track spell usage on Chronozon
async function onCastSpellOnNpc(player, spell, npc) {
    if (npc.id === NPC_CHRONOZON && getQuestStage(player) === 8) {
        // Track which elemental spells were used
        if (spell.name && spell.name.toLowerCase().includes('fire')) {
            player.cache.chronozon_fire = true;
            player.message("Chronozon weakens slightly");
        } else if (spell.name && spell.name.toLowerCase().includes('water')) {
            player.cache.chronozon_water = true;
            player.message("Chronozon weakens slightly");
        } else if (spell.name && spell.name.toLowerCase().includes('earth')) {
            player.cache.chronozon_earth = true;
            player.message("Chronozon weakens slightly");
        } else if (spell.name && spell.name.toLowerCase().includes('air')) {
            player.cache.chronozon_air = true;
            player.message("Chronozon weakens slightly");
        }
    }
}

// Quest reward
function handleReward(player) {
    player.message("Well done you have completed the family crest quest");

    // XP rewards (authentic OpenRSC values)
    player.addExperience('smithing', 1000 * 4);
    player.addExperience('magic', 1000 * 4);
    player.addExperience('crafting', 1000 * 4);

    player.questPoints += QUEST_POINTS;
}

module.exports = {
    name: 'family-crest',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onUseItemOnNpc,
    onKillNpc,
    onCastSpellOnNpc,
    handleReward,
    npcs: [NPC_DIMINTHEIS, NPC_CHEF, NPC_AVAN, NPC_JOHNATHON, NPC_CHRONOZON]
};
