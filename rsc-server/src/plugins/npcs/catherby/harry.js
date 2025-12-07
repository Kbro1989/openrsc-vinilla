// Harry's Fishing Shack (Catherby)
const HARRY = 250;
const SHOP_ID = "harrys-fishing-shack";

async function onTalkToNPC(player, npc) {
    if (npc.id !== HARRY) return false;
    player.engage(npc);

    await npc.say("Welcome you can buy fishing equipment at my store", "We'll also buy fish that you catch off you");
    const menu = await player.ask([
        "Let's see what you've got then",
        "Sorry, I'm not interested"
    ], true);

    if (menu === 0) {
        await npc.say("Let's see what you've got then"); // OpenRSC mimics player saying this?
        player.openShop(SHOP_ID);
    } else if (menu === 1) {
        await npc.say("Sorry, I'm not interested"); // OpenRSC mimics player saying this?
        // Actually standard RSC usually has player speak the option text.
        // My engine (player.ask) handles the player saying the option automatically if true is passed.
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
