const ItemId = {
    LOGS: 14,
    RAW_SHRIMP: 349,
    SHRIMP: 350,
    BURNT_SHRIMP: 352,
    RAW_RAT_MEAT: 503,
    COOKED_MEAT: 132,
    BURNT_MEAT: 134,
    TIN_ORE: 202,
    COPPER_ORE: 150,
    BRONZE_BAR: 169
};

const ObjectIds = {
    TREE: 0, // Standard tree
    TREE_TUTORIAL: 304, // Verify ID
    FIRE: 97,
    FISHING_SPOT: 192, // Verify ID
    RANGE: 11, // Verify ID
    ROCKS_TIN: 77, // Verify ID
    ROCKS_COPPER: 78, // Verify ID
    FURNACE: 118,
    ANVIL: 177
};

async function onWallObjectCommandOne(player, object) {
    // This plugin handles object interactions for Tutorial Island resources
    // Since these are often standard objects, we check player location or tutorial stage

    // Woodcutting
    if (object.id === ObjectIds.TREE || object.id === ObjectIds.TREE_TUTORIAL) {
        if (player.cache.tutorial && player.cache.tutorial === 15) { // Survival Expert stage
            if (!player.inventory.has(12)) { // Bronze Axe
                player.message("You need an axe to chop this tree");
                return true;
            }
            player.message("You swing your axe at the tree...");
            await player.world.sleepTicks(3);
            player.message("You get some logs");
            player.inventory.add(ItemId.LOGS, 1);
            // Progress tutorial if needed, or just let them have logs
            return true;
        }
    }

    // Firemaking (usually onGroundItem, but if clicking fire?)
    // Firemaking is usually using tinderbox on logs (Inventory interaction)

    // Fishing
    if (object.id === ObjectIds.FISHING_SPOT) {
        if (player.cache.tutorial && player.cache.tutorial === 40) { // Fishing Instructor stage
            if (!player.inventory.has(376)) { // Net
                player.message("You need a net to catch shrimp");
                return true;
            }
            player.message("You attempt to catch some shrimp");
            await player.world.sleepTicks(3);
            player.message("You catch some shrimp");
            player.inventory.add(ItemId.RAW_SHRIMP, 1);
            return true;
        }
    }

    // Mining
    if (object.id === ObjectIds.ROCKS_TIN || object.id === ObjectIds.ROCKS_COPPER) {
        if (player.cache.tutorial && player.cache.tutorial === 45) { // Mining Instructor stage
            if (!player.inventory.has(156)) { // Bronze Pickaxe
                player.message("You need a pickaxe to mine this rock");
                return true;
            }
            player.message("You swing your pick at the rock...");
            await player.world.sleepTicks(3);
            player.message("You manage to mine some ore");
            player.inventory.add(object.id === ObjectIds.ROCKS_TIN ? ItemId.TIN_ORE : ItemId.COPPER_ORE, 1);
            return true;
        }
    }

    return false;
}

async function onUseWithGameObject(player, object, item) {
    // Cooking
    if (object.id === ObjectIds.RANGE || object.id === ObjectIds.FIRE) {
        if (item.id === ItemId.RAW_SHRIMP || item.id === ItemId.RAW_RAT_MEAT) {
            player.message("You cook the " + item.definition.name);
            await player.world.sleepTicks(2);
            player.inventory.remove(item.id, 1);
            // Simple success logic for tutorial
            if (item.id === ItemId.RAW_SHRIMP) player.inventory.add(ItemId.SHRIMP, 1);
            else player.inventory.add(ItemId.COOKED_MEAT, 1);
            player.message("The meat is now cooked");

            if (player.cache.tutorial === 25 && item.id === ItemId.RAW_RAT_MEAT) {
                // Progression handled by talking to instructor usually, but maybe here too?
            }
            return true;
        }
    }

    // Smithing (Use ore on furnace)
    if (object.id === ObjectIds.FURNACE) {
        if (item.id === ItemId.TIN_ORE || item.id === ItemId.COPPER_ORE) {
            if (player.inventory.has(ItemId.TIN_ORE) && player.inventory.has(ItemId.COPPER_ORE)) {
                player.message("You smelt the copper and tin together in the furnace");
                await player.world.sleepTicks(2);
                player.inventory.remove(ItemId.TIN_ORE, 1);
                player.inventory.remove(ItemId.COPPER_ORE, 1);
                player.inventory.add(ItemId.BRONZE_BAR, 1);
                player.message("You retrieve a bronze bar");
                return true;
            }
        }
    }

    // Smithing (Use bar on anvil)
    if (object.id === ObjectIds.ANVIL) {
        if (item.id === ItemId.BRONZE_BAR) {
            if (!player.inventory.has(163)) { // Hammer
                player.message("You need a hammer to smith on the anvil");
                return true;
            }
            player.message("You hammer the bronze bar and make a dagger");
            await player.world.sleepTicks(2);
            player.inventory.remove(ItemId.BRONZE_BAR, 1);
            player.inventory.add(3, 1); // Bronze Dagger
            return true;
        }
    }

    return false;
}

module.exports = { onWallObjectCommandOne, onUseWithGameObject };
