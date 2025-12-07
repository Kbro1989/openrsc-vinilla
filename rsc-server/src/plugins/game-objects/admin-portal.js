// Admin Area Portal - Accessible only to ranks 2 and 3
// Located in Lumbridge near spawn

// Portal object ID (using a regular door or special object)
const ADMIN_PORTAL_ID = 60; // Iron Gate

async function onGameObjectCommandOne(player, gameObject) {
    // Check if this is the admin portal
    if (gameObject.id !== ADMIN_PORTAL_ID) {
        return false;
    }

    // Check if we're at the portal location (Lumbridge area)
    if (gameObject.x !== 120 || gameObject.y !== 652) {
        return false;
    }

    const { world } = player;

    // Check if player has group 2 or 3
    if (player.group < 2) {
        player.message('@que@This portal is restricted to staff members only.');
        return true;
    }

    // Teleport to admin area
    player.message('@gre@Welcome to the Admin Area.');
    player.teleport(50, 50);

    return true;
}

async function onGameObjectCommandTwo(player, gameObject) {
    // Exit portal in admin area
    if (gameObject.id !== ADMIN_PORTAL_ID) {
        return false;
    }

    // Check if we're at the exit location (admin area)
    if (gameObject.x !== 50 || gameObject.y !== 55) {
        return false;
    }

    // Teleport back to Lumbridge
    player.message('Returning to Lumbridge...');
    player.teleport(120, 653);

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
