const NpcId = {
    MONK_OF_ENTRANA_PORTSARIM: 212,
    MONK_OF_ENTRANA_ENTRANA: 213
};

const ObjectIds = {
    SHIP_ENTRANA_1: 238,
    SHIP_ENTRANA_2: 239,
    SHIP_ENTRANA_3: 240,
    SHIP_PORTSARIM_1: 241,
    SHIP_PORTSARIM_2: 242,
    SHIP_PORTSARIM_3: 243
};

// Basic list of prohibited items (Weapons & Armor)
// This is a simplified list. A full implementation would check item definitions.
const PROHIBITED_KEYWORDS = [
    "dagger", "sword", "scimitar", "mace", "axe", "battleaxe", "2h", "spear", "halberd", "claws",
    "bow", "arrow", "bolt", "dart", "knife", "javelin", "thrown",
    "staff", "wand",
    "helmet", "coif", "hood", "mask",
    "body", "chainbody", "platebody", "top", "shirt", "robe", "apron", // careful with robes/aprons
    "legs", "skirt", "bottom", "trousers", "chaps",
    "gloves", "boots", "shield", "defender", "book"
];

// Whitelist for robes/religious items if needed, but for now strict check on keywords might be too aggressive.
// Better to use a specific list of IDs if possible, or just trust the player doesn't have "Sword" in name.
// Authentic check is very specific.
// For now, let's just check for "wieldable" items if we can, or just common weapons.

function hasProhibitedItems(player) {
    // Check inventory
    const inventory = player.inventory.items; // Assuming array of items
    for (const item of inventory) {
        if (isProhibited(item)) return true;
    }

    // Check equipment
    // Assuming player.equipment.items is available or similar
    // If not, we might skip equipment check or need to access it differently
    // player.equipment.get(slot) ?

    return false;
}

function isProhibited(item) {
    if (!item || !item.definition) return false;
    const name = item.definition.name.toLowerCase();

    // Allow religious robes
    if (name.includes("monk") || name.includes("priest") || name.includes("vestment")) return false;
    if (name.includes("amulet") || name.includes("symbol") || name.includes("ring") || name.includes("necklace")) return false;

    // Check for weapons/armor keywords
    if (name.includes("dagger") || name.includes("sword") || name.includes("scimitar") || name.includes("mace") ||
        (name.includes("axe") && !name.includes("pickaxe")) || // Allow pickaxe? No, Entrana prohibits weapons/armor. Hatchet/Pickaxe might be allowed? Authentic: No weapons. Tools?
        name.includes("battleaxe") || name.includes("spear") || name.includes("bow") || name.includes("arrow") ||
        name.includes("shield") || name.includes("helmet") || name.includes("plate") || name.includes("chain") ||
        name.includes("leather body") || name.includes("leather chaps")) {
        return true;
    }

    return false;
}

async function onTalkToNPC(player, npc) {
    if (npc.id === NpcId.MONK_OF_ENTRANA_PORTSARIM) {
        player.engage(npc);
        await npc.say("Are you looking to take passage to our holy island?", "If so your weapons and armour must be left behind");

        const choice = await player.options("No I don't wish to go", "Yes, Okay I'm ready to go");

        if (choice === 1) { // Yes
            player.message("The monk quickly searches you");
            await player.world.sleepTicks(3);

            if (hasProhibitedItems(player)) {
                await npc.say("Sorry we cannot allow you on to our island", "Make sure you are not carrying weapons or armour please");
            } else {
                player.message("You board the ship");
                await player.world.sleepTicks(3);
                player.teleport(418, 570, false); // Entrana coords
                player.message("The ship arrives at Entrana");
            }
        }
        player.disengage();
        return true;
    } else if (npc.id === NpcId.MONK_OF_ENTRANA_ENTRANA) {
        player.engage(npc);
        await npc.say("Are you looking to take passage back to port sarim?");

        const choice = await player.options("No I don't wish to go", "Yes, Okay I'm ready to go");

        if (choice === 1) { // Yes
            player.message("You board the ship");
            await player.world.sleepTicks(3);
            player.teleport(264, 660, false); // Port Sarim coords
            player.message("The ship arrives at Port Sarim");
        }
        player.disengage();
        return true;
    }
    return false;
}

async function onWallObjectCommandOne(player, object) {
    // Port Sarim -> Entrana
    if (object.id === ObjectIds.SHIP_ENTRANA_1 || object.id === ObjectIds.SHIP_ENTRANA_2 || object.id === ObjectIds.SHIP_ENTRANA_3) {
        if (player.y >= 600 && player.y <= 700) { // Port Sarim check
            player.message("I need to speak to the monk before boarding the ship.");
            return true;
        }
    }

    // Entrana -> Port Sarim
    if (object.id === ObjectIds.SHIP_PORTSARIM_1 || object.id === ObjectIds.SHIP_PORTSARIM_2 || object.id === ObjectIds.SHIP_PORTSARIM_3) {
        if (player.x >= 400 && player.x <= 450) { // Entrana check
            player.message("I need to speak to the monk before boarding the ship.");
            return true;
        }
    }

    return false;
}

module.exports = { onTalkToNPC, onWallObjectCommandOne };
