// Generic Shop Keeper / Assistant Plugin
// Handles generic IDs (Shop Keeper, Shop Assistant) by opening the shop appropriate for the player's location.

const SHOP_KEEPER = 528;
const SHOP_ASSISTANT_IDS = [82, 83, 88, 101, 106, 115, 130, 131, 146, 169, 173, 186, 223, 250, 435, 528]; // Broad list to catch all variants if needed, or just specific generic ones.
// Precise Generic IDs: 
const GENERIC_IDS = [528, 82, 83, 88, 106, 130, 146, 169, 186];

async function onTalkToNPC(player, npc) {
    if (!GENERIC_IDS.includes(npc.id)) return false;

    // Determine Shop ID by Location
    let shopId = "general-store"; // Default

    const x = player.x;
    const y = player.y;

    // Varrock: 124-129, 513-518
    if (x >= 120 && x <= 140 && y >= 500 && y <= 530) shopId = "varrock-general";

    // Falador: 317-322, 530-536
    else if (x >= 310 && x <= 330 && y >= 520 && y <= 550) shopId = "falador-general";

    // Lumbridge
    else if (x >= 110 && x <= 140 && y >= 630 && y <= 660) shopId = "lumbridge-general";

    // Al Kharid
    else if (x >= 60 && x <= 100 && y >= 670 && y <= 720) shopId = "al-kharid-general";

    // Ardougne (East) 
    else if (x >= 570 && x <= 620 && y >= 570 && y <= 620) shopId = "east-ardougne-adventurers";

    // Rimmington
    else if (x >= 300 && x <= 350 && y >= 600 && y <= 650) shopId = "rimmington-general";

    // Edgeville
    else if (x >= 200 && x <= 230 && y >= 430 && y <= 470) shopId = "edgeville-general";

    player.engage(npc);
    await npc.say("Can I help you at all?");
    const menu = await player.ask(["Yes please, what are you selling?", "No thanks"], true);

    if (menu === 0) {
        await npc.say("Take a look");
        player.openShop(shopId); // Will fall back to default if not defined, or error handled by engine
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
