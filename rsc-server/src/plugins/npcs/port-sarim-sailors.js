const NpcId = {
    CAPTAIN_TOBIAS: 166,
    SEAMAN_LORRIS: 170,
    SEAMAN_THRESNOR: 171
};

const ItemId = {
    COINS: 10
};

const ObjectIds = {
    GANGPLANK_1: 155,
    GANGPLANK_2: 156,
    GANGPLANK_3: 157
};

async function onTalkToNPC(player, npc) {
    if (npc.id !== NpcId.CAPTAIN_TOBIAS && npc.id !== NpcId.SEAMAN_LORRIS && npc.id !== NpcId.SEAMAN_THRESNOR) {
        return false;
    }

    player.engage(npc);

    await npc.say("Do you want to go on a trip to Karamja?", "The trip will cost you 30 gold");

    const options = ["Yes please", "No thankyou"];
    // Note: Crandor option omitted for now as Dragon Slayer is not fully implemented

    const choice = await player.options(...options);

    if (choice === 0) { // Yes please
        if (player.inventory.remove(ItemId.COINS, 30)) {
            player.message("You pay 30 gold");
            await player.world.sleepTicks(3);
            player.message("You board the ship");
            await player.world.sleepTicks(3);
            player.teleport(324, 713, false);
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
    if (object.id === ObjectIds.GANGPLANK_1 || object.id === ObjectIds.GANGPLANK_2 || object.id === ObjectIds.GANGPLANK_3) {
        // Check if at Port Sarim (approximate coords)
        if (player.y >= 600 && player.y <= 700) { // Rough check, better to check exact coords if possible
            // Authentic check: must talk to captain first
            player.message("I need to speak to the captain before boarding the ship.");
            return true;
        }
    }
    return false;
}

module.exports = { onTalkToNPC, onWallObjectCommandOne };
