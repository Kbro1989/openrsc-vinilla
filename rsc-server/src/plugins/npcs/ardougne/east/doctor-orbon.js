// Doctor Orbon (Ardougne East - Sheep Herder Quest)
const DOCTOR_ORBON = 435;
const PROTECTIVE_JACKET = 760;
const PROTECTIVE_TROUSERS = 761;
const COINS = 10; // ID 10 is Coins. Price 100gp.

async function onTalkToNPC(player, npc) {
    if (npc.id !== DOCTOR_ORBON) return false;
    player.engage(npc);

    // Check Quest Stage for Sheep Herder
    const stage = player.questStages.sheepHerder || 0;

    if (stage === -1) { // Quest complete
        await npc.say("well hello again", "i was so relieved when i heard you disposed of the plagued sheep", "Now the town is safe");
    }
    else if (stage === 1) { // Started
        await player.say("hi doctor", "I need to aquire some protective clothing", "so i can recapture some escaped sheep who have the plague");
        await npc.say("I'm afraid i only have one suit", "Which i made to keep myself safe from infected patients",
            "I could sell it to you", "then i could make myself another", "hmmm..i'll need at least 100 gold coins");

        const menu = await player.ask(["Sorry doc, that's too much", "Ok i'll take it"], true);
        if (menu === 1) { // Take it
            if (player.inventory.remove(COINS, 100)) {
                player.message("you give doctor orbon 100 coins");
                player.message("doctor orbon gives you a protective suit");
                player.inventory.add(PROTECTIVE_TROUSERS, 1);
                player.inventory.add(PROTECTIVE_JACKET, 1);
                await npc.say("these will keep you safe from the plague");
                player.updateQuestStage("sheepHerder", 2);
            } else {
                await player.say("oops, I don't have enough money");
                await npc.say("that's ok, but don't go near those sheep", "if you can find the money i'll be waiting here");
            }
        }
    }
    else if (stage === 2) { // In Progress
        await npc.say("have you managed to get rid of those sheep?");
        await player.say("not yet");
        await npc.say("you must hurry", "they could have the whole town infected in days");

        // Check if player lost the suit
        if (!player.inventory.contains(PROTECTIVE_TROUSERS) || !player.inventory.contains(PROTECTIVE_JACKET)) {
            await npc.say("I see you don't have your protective clothing with you", "Would you like to buy some more?", "Same price as before");
            const more = await player.ask(["No i don't need any more", "Ok i'll take it"], true);
            if (more === 1) {
                if (player.inventory.remove(COINS, 100)) {
                    player.message("you give doctor orbon 100 coins");
                    player.message("doctor orbon gives you a protective suit");
                    player.inventory.add(PROTECTIVE_TROUSERS, 1);
                    player.inventory.add(PROTECTIVE_JACKET, 1);
                    await npc.say("these will keep you safe from the plague");
                } else {
                    await player.say("oops, I don't have enough money");
                }
            }
        }
    }
    else { // Default
        await player.say("hello");
        await npc.say("how do you feel?", "no heavy flu or the shivers?");
        await player.say("no, i'm fine");
        await npc.say("good good", "have to be carefull nowadays", "the plague spreads faster than a common cold");
        const menu = await player.ask(["The plague? tell me more", "Ok i'll be careful"], true);
        if (menu === 0) {
            await npc.say("the virus came from the west and is deadly");
            await player.say("what are the symtoms?");
            await npc.say("watch out for abnormal nightmares and strong flu symtoms",
                "when you find a thick black liquid dripping from your nose and eyes", "then no one can save you");
        } else {
            await npc.say("you do that traveller");
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
