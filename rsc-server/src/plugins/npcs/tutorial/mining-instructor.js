const MINING_INSTRUCTOR = 482;
const BRONZE_PICKAXE = 156;

async function onTalkToNPC(player, npc) {
    if (npc.id !== MINING_INSTRUCTOR) {
        return false;
    }

    player.engage(npc);
    const tutorialStage = player.cache.tutorial || 0;

    if (tutorialStage === 45) {
        await player.say("Good day to you");
        await npc.say(
            "hello I'm a veteran miner!",
            "I'm here to show you how to mine",
            "If you want to quickly find out what is in a rock you can prospect it",
            "right click on this rock here",
            "And select prospect"
        );
        player.cache.tutorial = 49;
    } else if (tutorialStage === 49) {
        await player.say("Hello again");
        await npc.say(
            "You haven't prospected that rock yet",
            "Right click on it and select prospect"
        );
    } else if (tutorialStage === 50) {
        await player.say("There's tin ore in that rock");
        await npc.say(
            "Yes, thats what's in there",
            "Ok you need to get that tin out of the rock",
            "First of all you need a pick",
            "And here we have a pick"
        );
        player.message("The instructor somehow produces a large pickaxe from inside his jacket");
        await player.world.sleepTicks(3);
        player.message("The instructor gives you the pickaxe");
        await player.world.sleepTicks(3);
        player.inventory.add(BRONZE_PICKAXE);
        await npc.say("Now hit those rocks");
        player.cache.tutorial = 51;
    } else if (tutorialStage === 51) {
        if (!player.inventory.has(BRONZE_PICKAXE)) {
            await player.say("I have lost my pickaxe");
            player.message("The instructor somehow produces a large pickaxe from inside his jacket");
            await player.world.sleepTicks(3);
            player.message("The instructor gives you the pickaxe");
            await player.world.sleepTicks(3);
            player.inventory.add(BRONZE_PICKAXE);
        }
        await npc.say(
            "to mine a rock just left click on it",
            "If you have a pickaxe in your inventory you might get some ore"
        );
    } else if (tutorialStage >= 52) {
        if (tutorialStage === 52) {
            await npc.say("very good");
        }
        await npc.say(
            "If at a later date you find a rock with copper ore",
            "You can take the copper ore and tin ore to a furnace",
            "use them on the furnace to make bronze bars",
            "which you can then either sell",
            "or use on anvils with a hammer",
            "To make weapons",
            "as your mining and smithing levels grow",
            "you will be able to mine various exciting new metals",
            "now go through the next door to speak to the bankers"
        );
        if (tutorialStage === 52) {
            player.cache.tutorial = 55;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
