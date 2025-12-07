// Chemist (Rimmington)
// Biohazard Quest (Stage 6, 7)

const CHEMIST_490 = 490;
const CHEMIST_504 = 504;

const DOCTORS_GOWN = 802;
const PLAGUE_SAMPLE = 815; // Verify ID
const TOUCH_PAPER = 816; // Verify ID
const LIQUID_HONEY = 817;
const ETHENEA = 818;
const SULPHURIC_BROLINE = 819;

// Quest Keys
// 'biohazard'

async function onTalkToNPC(player, npc) {
    if (npc.id !== CHEMIST_490 && npc.id !== CHEMIST_504) {
        return false;
    }

    player.engage(npc);
    const stage = player.questStages.biohazard || 0;

    if (stage === 7) {
        await player.ask(["hello again"], true);
        await npc.say("oh hello, do you need more touch paper?");
        if (!player.inventory.contains(TOUCH_PAPER)) {
            await player.ask(["yes please"], true);
            await npc.say("ok there you go");
            player.message("the chemist gives you some touch paper");
            player.inventory.add(TOUCH_PAPER, 1);
        } else {
            await player.ask(["no i just wanted to say hello"], true);
            await npc.say("oh, ok then ... hello");
        }
    }
    else if (stage === 6 && player.inventory.contains(PLAGUE_SAMPLE)) {
        await npc.say("Sorry, I'm afraid we're just closing now, you'll have to come back another time");
        const choice = await player.ask([
            "This can't wait, I'm carrying a plague sample that desperately needs analysis",
            "It's OK I'm Elena's friend"
        ], true);

        if (choice === 0) {
            await npc.say("You idiot! A plague sample should be confined to a lab", "I'm taking it off you- I'm afraid it's the only responsible thing to do");
            player.message("He takes the plague sample from you");
            player.inventory.remove(PLAGUE_SAMPLE, 1);
            // Fail state? Authentic RSC doesn't reset quest, just removes item so you must go back to Elena.
        } else {
            await npc.say("Oh, well that's different then. Must be pretty important to come all this way");
            const subChoice = await player.ask([
                "that's why I'm here: I need some more touch paper for this plague sample",
                "Who knows... I just need some touch paper for a guy called Guidor"
            ], true);

            if (subChoice === 0) {
                await npc.say("You idiot! A plague sample should be confined to a lab", "I'm taking it off you- I'm afraid it's the only responsible thing to do");
                player.message("He takes the plague sample from you");
                player.inventory.remove(PLAGUE_SAMPLE, 1);
            } else {
                await npc.say("Guidor? This one's on me then- the poor guy. Sorry about the interrogation");
                await player.ask(["Oh right...so am I going to be OK carrying these three vials with me?"], true);
                await npc.say(
                    "With touch paper as well? You're asking for trouble",
                    "You'd be better using my errand boys outside- give them a vial each",
                    "They're not the most reliable people in the world... but it's better than entering Varrock with half a laborotory"
                );
                await player.ask(["OK- thanks for your help, I know that Elena appreciates it"], true);
                await npc.say("Yes well don't stand around here gassing", "You'd better hurry if you want to see Guidor");

                player.message("He gives you the touch paper");
                player.inventory.add(TOUCH_PAPER, 1);
                player.updateQuestStage('biohazard', 7);
            }
        }
    } else {
        player.message("The chemist is busy at the moment");
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
