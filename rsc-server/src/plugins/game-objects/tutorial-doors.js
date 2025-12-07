const BoundaryId = {
    DOOR_CONTINUE_START_GUIDE: 125,
    DOOR_CONTINUE_CONTROLS_GUIDE: 143,
    DOOR_CONTINUE_COMBAT_INSTRUCTOR: 130,
    DOOR_CONTINUE_COOKING_INSTRUCTOR: 129,
    DOOR_CONTINUE_FINANCIAL_ADVISOR: 134,
    DOOR_CONTINUE_FISHING_INSTRUCTOR: 131,
    DOOR_CONTINUE_MINING_INSTRUCTOR: 132,
    DOOR_CONTINUE_BANK_ASSISTANT: 133,
    DOOR_CONTINUE_QUEST_ADVISOR: 136,
    DOOR_CONTINUE_WILDERNESS_GUIDE: 139,
    DOOR_CONTINUE_MAGIC_INSTRUCTOR: 140,
    DOOR_CONTINUE_FATIGUE_EXPERT: 213,
    DOOR_CONTINUE_COMMUNITY_INSTRUCTOR: 142
};

async function onWallObjectCommandOne(player, object) {
    const id = object.id;
    const x = object.x;
    const y = object.y;

    if (id === BoundaryId.DOOR_CONTINUE_START_GUIDE && x === 222 && y === 743) {
        if (player.cache.tutorial && player.cache.tutorial >= 10) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to a guide before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_CONTROLS_GUIDE && x === 224 && y === 737) {
        if (player.cache.tutorial && player.cache.tutorial >= 15) {
            await doDoor(player, object);
        } else {
            player.message("Speak to the controls guide before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_COMBAT_INSTRUCTOR && x === 220 && y === 727) {
        if (player.cache.tutorial && player.cache.tutorial >= 25) {
            await doDoor(player, object);
        } else {
            player.message("Speak to the combat instructor before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_COOKING_INSTRUCTOR && x === 212 && y === 729) {
        if (player.cache.tutorial && player.cache.tutorial >= 35) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to a cooking instructor before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_FINANCIAL_ADVISOR && x === 206 && y === 730) {
        if (player.cache.tutorial && player.cache.tutorial >= 40) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to a finance advisor before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_FISHING_INSTRUCTOR && x === 201 && y === 734) {
        if (player.cache.tutorial && player.cache.tutorial >= 45) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to the fishing instructor before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_MINING_INSTRUCTOR && x === 198 && y === 746) {
        if (player.cache.tutorial && player.cache.tutorial >= 55) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to the mining instructor before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_BANK_ASSISTANT && x === 204 && y === 752) {
        if (player.cache.tutorial && player.cache.tutorial >= 60) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to a bank assistant before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_QUEST_ADVISOR && x === 209 && y === 754) {
        if (player.cache.tutorial && player.cache.tutorial >= 65) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to the quest advisor before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_WILDERNESS_GUIDE && x === 217 && y === 760) {
        if (player.cache.tutorial && player.cache.tutorial >= 70) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to the wilderness guide before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_MAGIC_INSTRUCTOR && x === 222 && y === 760) {
        if (player.cache.tutorial && player.cache.tutorial >= 80) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to a magic instructor before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_FATIGUE_EXPERT && x === 226 && y === 760) {
        if (player.cache.tutorial && player.cache.tutorial >= 90) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to a fatigue expert before going through this door");
        }
        return true;
    } else if (id === BoundaryId.DOOR_CONTINUE_COMMUNITY_INSTRUCTOR && x === 230 && y === 759) {
        if (player.cache.tutorial && player.cache.tutorial >= 100) {
            await doDoor(player, object);
        } else {
            player.message("You should speak to the community instructor before going through this door");
        }
        return true;
    }

    return false;
}

async function doDoor(player, object) {
    player.message("You go through the door");
    await player.world.replaceGameObject(object, 1); // 1 = DOORFRAME
    await player.world.sleepTicks(2);
    // Restore door after a delay
    setTimeout(async () => {
        await player.world.replaceGameObject(object, object.id);
    }, 3000);
}

module.exports = { onWallObjectCommandOne };
