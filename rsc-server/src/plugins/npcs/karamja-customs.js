const NpcId = {
    CUSTOMS_OFFICER: 163
};

const ItemId = {
    COINS: 10,
    KARAMJA_RUM: 318
};

const ObjectIds = {
    GANGPLANK_1: 161,
    GANGPLANK_2: 162,
    GANGPLANK_3: 163
};

async function onTalkToNPC(player, npc) {
    if (npc.id !== NpcId.CUSTOMS_OFFICER) {
        return false;
    }

    player.engage(npc);

    const choice = await player.options("Can I board this ship?", "Does Karamja have any unusual customs then?");

    if (choice === 0) { // Can I board
        await talkToOfficer(player, npc);
    } else { // Unusual customs
        await npc.say("I'm not that sort of customs officer");
    }

    player.disengage();
    return true;
}

async function talkToOfficer(player, npc) {
    await npc.say("You need to be searched before you can board");

    const subChoice = await player.options("Why?", "Search away I have nothing to hide", "You're not putting your hands on my things");

    if (subChoice === 0) { // Why?
        await npc.say("Because Asgarnia has banned the import of intoxicating spirits");
        // Loop back or end? Authentic usually continues or ends. Let's end for simplicity or recurse.
        // Recursing might be cleaner but let's just end.
    } else if (subChoice === 1) { // Search away
        if (player.inventory.has(ItemId.KARAMJA_RUM)) {
            await npc.say("Aha trying to smuggle rum are we?");
            player.message("The customs officer confiscates your rum");
            await player.world.sleepTicks(3);
            player.inventory.remove(ItemId.KARAMJA_RUM);
        } else {
            await npc.say("Well you've got some odd stuff, but it's all legal", "Now you need to pay a boarding charge of 30 gold");

            const payChoice = await player.options("Ok", "Oh, I'll not bother then");

            if (payChoice === 0) { // Ok
                if (player.inventory.remove(ItemId.COINS, 30)) {
                    await npc.say("Ok");
                    player.message("You pay 30 gold");
                    await player.world.sleepTicks(3);
                    player.message("You board the ship");
                    await player.world.sleepTicks(3);
                    player.teleport(269, 648, false);
                    player.message("The ship arrives at Port Sarim");
                } else {
                    await npc.say("Oh dear I don't seem to have enough money");
                }
            } else { // Not bother
                await npc.say("Oh I'll not bother then");
            }
        }
    } else { // Not putting hands
        await npc.say("You're not getting on this ship then");
    }
}

async function onWallObjectCommandOne(player, object) {
    if (object.id === ObjectIds.GANGPLANK_1 || object.id === ObjectIds.GANGPLANK_2 || object.id === ObjectIds.GANGPLANK_3) {
        // Check if at Karamja (approximate coords)
        if (player.y >= 700) {
            player.message("I need to speak to the customs officer before boarding the ship.");
            return true;
        }
    }
    return false;
}

module.exports = { onTalkToNPC, onWallObjectCommandOne };
