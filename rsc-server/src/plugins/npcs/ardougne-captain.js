const NpcId = {
    CAPTAIN_BARNABY: 316
};

const ItemId = {
    COINS: 10
};

const ObjectIds = {
    GANGPLANK: 157
};

async function onTalkToNPC(player, npc) {
    if (npc.id !== NpcId.CAPTAIN_BARNABY) {
        return false;
    }

    player.engage(npc);

    await npc.say("Do you want to go on a trip to Karamja?", "The trip will cost you 30 gold");

    const options = ["Yes please", "No thankyou"];
    // Note: Crandor option omitted for now

    const choice = await player.options(...options);

    if (choice === 0) { // Yes please
        if (player.inventory.remove(ItemId.COINS, 30)) {
            player.message("You pay 30 gold");
            await player.world.sleepTicks(3);
            player.message("You board the ship");
            await player.world.sleepTicks(3);
            player.teleport(467, 651, false); // Brimhaven coords (approx)
            await player.world.sleepTicks(2);
            player.message("The ship arrives at Karamja");
        } else {
            await npc.say("Oh dear I don't seem to have enough money");
        }
    } else { // No thankyou
        await npc.say("No I need to stay alive", "I have a wife and family to support");
    }

    player.disengage();
    return true;
}

async function onWallObjectCommandOne(player, object) {
    if (object.id === ObjectIds.GANGPLANK) {
        // Check if at Ardougne (approximate coords)
        if (player.x >= 500) {
            player.message("I need to speak to the captain before boarding the ship.");
            return true;
        }
    }
    return false;
}

module.exports = { onTalkToNPC, onWallObjectCommandOne };
