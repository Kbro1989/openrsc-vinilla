// Arhein (Catherby General Store)
const ARHEIN = 280;
const SHOP_ID = "arheins-general";

async function onTalkToNPC(player, npc) {
    if (npc.id !== ARHEIN) return false;
    player.engage(npc);

    await npc.say("Hello would you like to trade");

    const menu = await player.ask([
        "Yes ok",
        "No thankyou",
        "Is that your ship?"
    ], true);

    if (menu === 0) {
        player.openShop(SHOP_ID);
    } else if (menu === 1) {
        // Leave
    } else if (menu === 2) {
        await npc.say("Yes I use it to make deliver my goods up and down the coast",
            "These crates here are all ready for my next trip");

        // Authentic branch for Merlin's Crystal / Travel
        const subMenu = await player.ask([
            "Where do you deliver too?",
            "Are you rich then?"
        ], true);

        if (subMenu === 0) {
            await npc.say("Oh various places up and down the coast", "Mostly Karamja and Port Sarim");
            await player.ask(["I don't suppose I could get a lift anywhere?", "Well good luck with your buisness"], true);
            if (player.vars.lastOption === 0) {
                await npc.say("I'm not quite ready to sail yet");
            }
        } else if (subMenu === 1) {
            await npc.say("Business is going reasonably well", "But I'm doing reasonably well");
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
