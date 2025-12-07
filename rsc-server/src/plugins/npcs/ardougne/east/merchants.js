// Ardougne Market Merchants
const BAKER = 325;
const FUR_TRADER = 327;
const GEM_MERCHANT = 330;
const SILVER_MERCHANT = 328;
const SPICE_MERCHANT = 329;

const SHOPS = {
    [BAKER]: "baker-ardougne",
    [FUR_TRADER]: "fur-merchant-ardougne",
    [GEM_MERCHANT]: "gem-merchant-ardougne",
    [SILVER_MERCHANT]: "silver-merchant-ardougne",
    [SPICE_MERCHANT]: "spice-merchant-ardougne"
};

async function onTalkToNPC(player, npc) {
    const shopId = SHOPS[npc.id];
    if (!shopId) return false;

    player.engage(npc);

    // Specific dialogues based on ID
    if (npc.id === BAKER) {
        await npc.say("Would you like ze nice freshly baked bread", "Or perhaps a nice piece of cake");
        const menu = await player.ask(["Lets see what you have", "No thankyou"], true);
        if (menu === 0) player.openShop(shopId);
    }
    else if (npc.id === FUR_TRADER) {
        await npc.say("would you like to do some fur trading?");
        const menu = await player.ask(["yes please", "No thank you"], true);
        if (menu === 0) player.openShop(shopId);
    }
    else if (npc.id === GEM_MERCHANT) {
        await npc.say("Here, look at my lovely gems");
        const menu = await player.ask(["Ok show them to me", "I'm not interested thankyou"], true);
        if (menu === 0) player.openShop(shopId);
    }
    else if (npc.id === SILVER_MERCHANT) {
        await npc.say("Silver! Silver!", "Best prices for buying and selling in all Kandarin!");
        const menu = await player.ask(["Yes please", "No thankyou"], true);
        if (menu === 0) player.openShop(shopId);
    }
    else if (npc.id === SPICE_MERCHANT) {
        await npc.say("Get your exotic spices here", "rare very valuable spices here");
        const menu = await player.ask(["Lets have a look them then", "No thank you I'm not interested"], true);
        if (menu === 0) player.openShop(shopId);
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
