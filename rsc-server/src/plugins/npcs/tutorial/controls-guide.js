const CONTROLS_GUIDE = 499;

async function onTalkToNPC(player, npc) {
    if (npc.id !== CONTROLS_GUIDE) {
        return false;
    }

    player.engage(npc);

    await player.message("Hello I'm here to tell you more about the game's controls");
    await player.message("Most of your options and character information");
    await player.message("can be accesed by the menus in the top right corner of the screen");
    await player.message("moving your mouse over the map icon");
    await player.message("which is the second icon from the right");
    await player.message("gives you a view of the area you are in");
    await player.message("clicking on this map is an effective way of walking around");
    await player.message("though if the route is blocked, for example by a closed door");
    await player.message("then your character won't move");
    await player.message("Also notice the compass on the map which may be of help to you");

    await player.say("Thankyou for your help");
    await player.message("Now carry on to speak to the combat instructor");

    if (player.cache.tutorial && player.cache.tutorial < 15) {
        player.cache.tutorial = 15;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
