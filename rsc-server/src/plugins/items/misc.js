const DISK_OF_RETURNING = 387;

async function onInventoryCommand(player, item) {
    if (item.id !== DISK_OF_RETURNING) {
        return false;
    }

    // Black Hole bounds: 303, 3298 to 307, 3302
    const { x, y } = player;
    const onBlackHole = x >= 303 && x <= 307 && y >= 3298 && y <= 3302;

    if (onBlackHole) {
        player.message("You spin your disk of returning");
        await player.world.sleepTicks(1);
        player.teleport(311, 3348, true);
        player.inventory.remove(DISK_OF_RETURNING);
        player.message("consuming your disk of returning");
    } else {
        player.message("The disk will only work from in Thordur's black hole");
    }

    return true;
}

module.exports = { onInventoryCommand };
