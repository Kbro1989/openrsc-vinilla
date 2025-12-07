async function onGameObjectCommandOne(player, gameObject) {
    if (!/sleep|rest|lie in/i.test(gameObject.definition.commands[0])) {
        return false;
    }

    player.message('@que@You rest in the bed...');
    player.fatigue = 0;
    player.sendFatigue();
    player.message('@que@You feel refreshed!');

    return true;
}

module.exports = { onGameObjectCommandOne };
