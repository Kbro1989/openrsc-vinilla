// Admin Area Initialization
// Spawns the admin portal in Lumbridge on server start

const GameObject = require('../model/game-object');

async function onWorldInit(world) {
    // Spawn admin portal in Lumbridge (F2P area near spawn)
    const adminPortal = new GameObject(world, {
        x: 120,
        y: 652,
        id: 60, // Iron Gate
        direction: 0,
        type: 0
    });

    world.gameObjects.add(adminPortal);

    console.log('[Admin] Admin portal spawned at Lumbridge (120, 652)');
}

module.exports = { onWorldInit };
