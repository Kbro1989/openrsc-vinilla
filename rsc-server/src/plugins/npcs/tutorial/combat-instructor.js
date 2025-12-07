const COMBAT_INSTRUCTOR = 474;
const RAT_TUTORIAL = 473;
const WOODEN_SHIELD = 4;
const BRONZE_LONG_SWORD = 70;

async function onTalkToNPC(player, npc) {
    if (npc.id !== COMBAT_INSTRUCTOR) {
        return false;
    }

    player.engage(npc);

    const tutorialStage = player.cache.tutorial || 0;

    if (tutorialStage === 15) {
        if (!player.inventory.has(WOODEN_SHIELD) && !player.inventory.has(BRONZE_LONG_SWORD)) {
            await player.say("Aha a new recruit");
            await npc.say(
                "I'm here to teach you the basics of fighting",
                "First of all you need weapons"
            );

            player.inventory.add(WOODEN_SHIELD);
            player.inventory.add(BRONZE_LONG_SWORD);
            player.message("The instructor gives you a sword and shield");
            await player.world.sleepTicks(3);

            await npc.say(
                "look after these well",
                "These items will now have appeared in your inventory",
                "You can access them by selecting the bag icon in the menu bar",
                "which can be found in the top right hand corner of the screen",
                "To wield your weapon and shield left click on them within your inventory",
                "their box will go red to show you are wearing them"
            );
            player.message("When you have done this speak to the combat instructor again");
            player.cache.tutorial = 16;
        }
    } else if (tutorialStage === 16) {
        const hasShieldEquipped = player.inventory.isWearing(WOODEN_SHIELD);
        const hasSwordEquipped = player.inventory.isWearing(BRONZE_LONG_SWORD);

        if (hasShieldEquipped && hasSwordEquipped) {
            await npc.say("Today we're going to be killing giant rats");

            // Check for nearby rats
            // const nearbyRat = player.world.npcs.find(n => n.id === RAT_TUTORIAL && n.withinRange(player, 10));
            // For now, assume rats are there or spawn one logic (simplified)

            await npc.say(
                "move your mouse over a rat you will see it is level 7",
                "You will see that it's level is written in green",
                "If it is green this means you have a strong chance of killing it",
                "creatures with their name in red should probably be avoided",
                "As this indicates they are tougher than you",
                "left click on the rat to attack it"
            );
        } else {
            await npc.say(
                "You need to wield your equipment",
                "You can access it by selecting the bag icon",
                "which can be found in the top right hand corner of the screen",
                "To wield your weapon and shield left click on them",
                "their boxs will go red to show you are wearing them"
            );
            player.message("When you have done this speak to the combat instructor again");
        }
    } else if (tutorialStage >= 20) {
        await npc.say(
            "Well done you're a born fighter",
            "As you kill things",
            "Your combat experience will go up",
            "this expereince will slowly cause you to get tougher",
            "eventually you will be able to take on stronger enemies",
            "Such as those found in dungeons",
            "Now contine to the building to the northeast"
        );
        if (tutorialStage < 25) {
            player.cache.tutorial = 25;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
