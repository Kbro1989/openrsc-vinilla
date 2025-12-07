const SURVIVAL_EXPERT = 475; // Placeholder ID (Golrie), need to verify authentic ID

async function onTalkToNPC(player, npc) {
    if (npc.id !== SURVIVAL_EXPERT) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "Hello there, newcomer",
        "My job is to teach you the basics of survival",
        "You're going to need a few tools to survive out here"
    );

    if (!player.inventory.has(12)) { // Bronze Axe
        await npc.say("Here, take this axe");
        player.inventory.add(12, 1);
        player.message("The survival expert gives you a bronze axe");
    }

    if (!player.inventory.has(166)) { // Tinderbox
        await npc.say("And you'll need this tinderbox to make a fire");
        player.inventory.add(166, 1);
        player.message("The survival expert gives you a tinderbox");
    }

    await npc.say(
        "Now, go cut down a tree and light a fire",
        "You'll need to click on the tree to chop it",
        "Then use the tinderbox on the logs to light them"
    );

    if (player.cache.tutorial && player.cache.tutorial < 15) {
        player.cache.tutorial = 15;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
