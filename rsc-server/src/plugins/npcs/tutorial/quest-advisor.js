const QUEST_ADVISOR = 489;

async function onTalkToNPC(player, npc) {
    if (npc.id !== QUEST_ADVISOR) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "Greetings traveller",
        "If you're interested in a bit of adventure",
        "I can recommend going on a good quest",
        "There are many secrets to be unconvered",
        "And wrongs to be set right",
        "If you talk to the various characters in the game",
        "Some of them will give you quests"
    );
    await player.say("What sort of quests are there to do?");
    await npc.say(
        "If you select the bar graph in the menu bar",
        "And then select the quests tabs",
        "You will see a list of quests",
        "quests you have completed will show up in green",
        "You can only do each quest once"
    );

    const menu = await player.ask([
        "Thank you for the advice",
        "Can you recommend any quests?"
    ]);

    if (menu === 0) {
        await player.say("thank you for the advice");
        await npc.say("good questing traveller");
        if (player.cache.tutorial && player.cache.tutorial < 65) {
            player.cache.tutorial = 65;
        }
    } else if (menu === 1) {
        await player.say("Can you recommend any quests?");
        await npc.say(
            "Well I hear the cook in Lumbridge castle is having some problems",
            "When you get to Lumbridge, go into the castle there",
            "Find the cook and have a chat with him"
        );
        await player.say("Okay thanks for the advice");
        if (player.cache.tutorial && player.cache.tutorial < 65) {
            player.cache.tutorial = 65;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
