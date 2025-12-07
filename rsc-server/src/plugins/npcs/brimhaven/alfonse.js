// Alfonse the Waiter (Brimhaven Shrimp and Parrot)
const ALFONSE = 260;
const SHOP_ID = "alfonses-shrimp-and-parrot";

async function onTalkToNPC(player, npc) {
    if (npc.id !== ALFONSE) return false;
    player.engage(npc);

    await npc.say("Welcome to the shrimp and parrot", "Would you like to order sir?");

    // Simplified menu: OpenRSC checks for Shield of Arrav gang status.
    // For authentic RSC, he simply serves unless you are on that quest.
    // We will mimic the shop flow first.

    const menu = await player.ask([
        "Yes please",
        "No thankyou",
        "Do you sell Gherkins?" // Trigger for Shield of Arrav
    ], true);

    if (menu === 0) {
        player.openShop(SHOP_ID);
    } else if (menu === 1) {
        // Leave
    } else if (menu === 2) {
        await npc.say("Hmm ask Charlie the cook round the back", "He may have some Gherkins for you");
        player.message("Alfonse winks");
        // Logic for quest variable would go here (player.vars.talked_alf = true)
    }

    player.disengage();
    return true;
}
module.exports = { onTalkToNPC };
