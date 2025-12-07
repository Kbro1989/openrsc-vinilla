const SLEEPING_BAG_ID = 1263;

async function onInventoryCommand(player, item) {
    if (item.id !== SLEEPING_BAG_ID) {
        return false;
    }

    player.message('@que@You rest using your sleeping bag...');
    player.fatigue = 0;
    player.sendFatigue();
    player.message('@que@You feel refreshed!');

    return true;
}

module.exports = { onInventoryCommand };
