const GUIDE = 476;

async function onTalkToNPC(player, npc) {
    if (npc.id !== GUIDE) {
        return false;
    }

    player.engage(npc);

    await player.message("Welcome to the world of runescape");
    await player.message("My job is to help newcomers find their feet here");
    await player.say("Ah good, let's get started");
    await player.message("when speaking to characters such as myself");
    await player.message("Sometimes options will appear in the top left corner of the screen");
    await player.message("left click on one of them to continue the conversation");

    const option = await player.ask([
        "So what else can you tell me?",
        "What other controls do I have?"
    ]);

    if (option >= 0) {
        await player.message("I suggest you go through the door now");
        await player.message("There are several guides and advisors on the island");
        await player.message("Speak to them");
        await player.message("They will teach you about the various aspects of the game");

        player.message("@que@Use the quest history tab at the bottom of the screen to reread things said to you by ingame characters");

        if (!player.cache.tutorial || player.cache.tutorial < 10) {
            player.cache.tutorial = 10;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
