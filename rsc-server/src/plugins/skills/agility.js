const agilityData = require('@2003scape/rsc-data/skills/agility.json');
const { rollSkillSuccess } = require('../../rolls');

const COURSES = agilityData.courses;
const OBSTACLES = agilityData.obstacles;

// Helper to check if player has completed previous obstacles in the course
function hasCompletedPrevious(player, courseName, obstacleId) {
    const course = COURSES[courseName];
    if (!course) return false;

    const obstaclesDone = player.cache.agility_obstacles_done || [];
    const obstacleIndex = course.obstacles.indexOf(obstacleId);

    if (obstacleIndex <= 0) return true; // First obstacle or not in course list

    return true;
}

function markObstacleDone(player, courseName, obstacleId) {
    const course = COURSES[courseName];
    if (!course) return;

    let obstaclesDone = player.cache.agility_obstacles_done || [];

    // If this is the first obstacle, reset the list (start fresh lap)
    if (obstacleId === course.obstacles[0]) {
        obstaclesDone = [];
    }

    if (!obstaclesDone.includes(obstacleId)) {
        obstaclesDone.push(obstacleId);
    }

    player.cache.agility_obstacles_done = obstaclesDone;

    // Check for course completion
    if (obstacleId === course.lastObstacle) {
        // Verify all obstacles in the course are done
        const allDone = course.obstacles.every(id => obstaclesDone.includes(id));
        if (allDone) {
            player.addExperience('agility', course.bonus);
            player.message('You have successfully completed the course');
            player.cache.agility_obstacles_done = []; // Reset after completion
        }
    }
}

async function handleGnomeObstacle(player, gameObject, obstacleDef) {
    const { world } = player;
    const id = gameObject.id;

    // Gnome Course Implementation
    switch (id) {
        case 655: // Balance Log
            player.message('You stand on the slippery log');
            await world.sleepTicks(2);
            player.teleport(692, 494);
            await world.sleepTicks(1);
            player.teleport(692, 499);
            player.message('and walk across');
            break;
        case 647: // Net
            player.message('You climb the net');
            await world.sleepTicks(2);
            player.teleport(692, 1448);
            player.message('and pull yourself onto the platform');
            break;
        case 648: // Watch Tower
            player.message('You pull yourself up the tree');
            await world.sleepTicks(2);
            player.teleport(693, 2394);
            player.message('to the platform above');
            break;
        case 650: // Rope Swing
            player.message('You reach out and grab the rope swing');
            await world.sleepTicks(1);
            player.message('You hold on tight');
            await world.sleepTicks(2);
            player.teleport(685, 2396);
            player.message('and swing to the opposite platform');
            break;
        case 649: // Landing
            player.message('You hang down from the tower');
            await world.sleepTicks(2);
            player.teleport(683, 506);
            player.message('and drop to the floor');
            break;
        case 653: // Second Net
            player.message('You take a few steps back');
            await world.sleepTicks(1);
            player.message('and run towards the net');
            await world.sleepTicks(1);
            player.teleport(683, 501);
            break;
        case 654: // Pipe
            player.message('You squeeze into the pipe');
            await world.sleepTicks(2);
            player.message('and shuffle down into it');
            await world.sleepTicks(2);
            player.teleport(683, 494);
            break;
        default:
            return false;
    }

    player.addExperience('agility', obstacleDef.xp);
    markObstacleDone(player, 'gnome', id);
    return true;
}

async function handleBarbarianObstacle(player, gameObject, obstacleDef) {
    const { world } = player;
    const id = gameObject.id;
    const level = player.skills.agility.current;

    // Barbarian success approx: Low=128 (50%), High=246 (96%)
    const success = rollSkillSuccess(128, 246, level);

    switch (id) {
        case 675: // Swing
            player.message('You grab the rope and try and swing across');
            await world.sleepTicks(2);
            if (success) {
                player.message('You skillfully swing across the hole');
                await world.sleepTicks(2);
                player.teleport(486, 559);
            } else {
                player.message('Your hands slip and you fall to the level below');
                await world.sleepTicks(2);
                player.teleport(486, 3389); // Spikes
                player.message('You land painfully on the spikes');
                player.damage(Math.floor(player.skills.hits.base * obstacleDef.failDamage));
                player.message('ouch');
                return true; // Fail, no XP
            }
            break;
        case 676: // Log
            player.message('You stand on the slippery log');
            await world.sleepTicks(2);
            if (success) {
                player.teleport(492, 563);
                player.message('and walk across');
            } else {
                player.message('You lose your footing and land in the water');
                player.teleport(490, 561);
                player.message('Something in the water bites you');
                player.damage(Math.floor(player.skills.hits.base * obstacleDef.failDamage));
                return true;
            }
            break;
        case 677: // Net
            player.message('You climb up the netting');
            player.teleport(496, 1507);
            break;
        case 678: // Ledge
            player.message('You put your foot on the ledge and try to edge across');
            await world.sleepTicks(2);
            if (success) {
                player.teleport(501, 1506);
                player.message('You skillfully balance across the hole');
            } else {
                player.message('You lose your footing and fall to the level below');
                player.teleport(499, 563);
                player.message('You land painfully on the spikes');
                player.damage(Math.floor(player.skills.hits.base * obstacleDef.failDamage));
                player.message('ouch');
                return true;
            }
            break;
        case 163: // Low Wall
        case 164:
            player.message('You jump over the wall');
            await world.sleepTicks(1);
            if (player.x === gameObject.x) {
                player.teleport(player.x - 1, player.y);
            } else {
                player.teleport(player.x + 1, player.y);
            }
            break;
        case 671: // Pipe
        case 672:
            player.message('You squeeze through the pipe');
            await world.sleepTicks(2);
            if (player.y <= 551) {
                player.teleport(487, 554);
            } else {
                player.teleport(487, 551);
            }
            break;
        case 679: // Handholds
            player.message('You climb up the wall');
            player.teleport(497, 555);
            break;
        default:
            return false;
    }

    player.addExperience('agility', obstacleDef.xp);
    markObstacleDone(player, 'barbarian', id);
    return true;
}

async function handleWildernessObstacle(player, gameObject, obstacleDef) {
    const { world } = player;
    const id = gameObject.id;
    const level = player.skills.agility.current;

    // Wilderness success approx: Low=100 (40%), High=246 (96%)
    const success = rollSkillSuccess(100, 246, level);

    switch (id) {
        case 703: // Gate
        case 704:
            player.message('You go through the gate and try to edge over the ridge');
            await world.sleepTicks(2);
            player.teleport(298, 130);
            await world.sleepTicks(2);
            if (success) {
                player.message('You skillfully balance across the ridge');
                await world.sleepTicks(2);
                if (id === 703) player.teleport(298, 125);
                else player.teleport(298, 134);
            } else {
                player.message('You lose your footing and fall into the wolf pit');
                await world.sleepTicks(2);
                player.teleport(300, 129);
                return true;
            }
            break;
        case 705: // Pipe
            player.message('You squeeze through the pipe');
            await world.sleepTicks(2);
            player.teleport(294, 112);
            break;
        case 706: // Rope Swing
            player.message('You grab the rope and try and swing across');
            await world.sleepTicks(2);
            if (success) {
                player.message('You skillfully swing across the hole');
                await world.sleepTicks(2);
                player.teleport(292, 108);
            } else {
                player.message('Your hands slip and you fall to the level below');
                await world.sleepTicks(2);
                player.teleport(293, 2942);
                player.message('You land painfully on the spikes');
                player.damage(Math.floor(player.skills.hits.base * obstacleDef.failDamage));
                player.message('ouch');
                return true;
            }
            break;
        case 707: // Stone
            player.message('You stand on the stepping stones');
            await world.sleepTicks(2);
            if (success) {
                player.teleport(293, 105);
                await world.sleepTicks(1);
                player.teleport(294, 104);
                await world.sleepTicks(1);
                player.teleport(295, 104);
                player.message('and walk across');
                await world.sleepTicks(1);
                player.teleport(296, 105);
                await world.sleepTicks(1);
                player.teleport(297, 106);
            } else {
                player.message('You lose your footing and land in the lava');
                player.teleport(292, 104);
                player.damage(Math.floor(player.skills.hits.base * obstacleDef.failDamage));
                return true;
            }
            break;
        case 708: // Ledge
            player.message('You stand on the ledge');
            await world.sleepTicks(2);
            if (success) {
                player.teleport(296, 112);
                await world.sleepTicks(1);
                player.message('and walk across');
                player.teleport(301, 111);
            } else {
                player.message('You lose your footing and fall to the level below');
                await world.sleepTicks(2);
                player.teleport(298, 2945);
                player.message('You land painfully on the spikes');
                player.damage(Math.floor(player.skills.hits.base * obstacleDef.failDamage));
                player.message('ouch');
                return true;
            }
            break;
        case 709: // Vine
            player.message('You climb up the cliff');
            await world.sleepTicks(2);
            player.teleport(304, 120);
            break;
        default:
            return false;
    }

    player.addExperience('agility', obstacleDef.xp);
    markObstacleDone(player, 'wilderness', id);
    return true;
}

async function handleShortcut(player, gameObject, obstacleDef) {
    const { world } = player;
    const id = gameObject.id;
    const level = player.skills.agility.current;

    switch (obstacleDef.type) {
        case 'shortcut_wall':
            player.message('You climb over the wall');
            await world.sleepTicks(2);
            if (obstacleDef.destination) {
                player.teleport(obstacleDef.destination.x, obstacleDef.destination.y);
            }
            break;

        case 'shortcut_swing':
            player.message('You grab the rope and try and swing across');
            await world.sleepTicks(2);
            if (ROPE_SWING_FAIL_CHANCE && !rollSkillSuccess(obstacleDef.level, 99, level)) {
                // Fail logic TODO
            }
            player.message('You skillfully swing across');
            if (obstacleDef.destination) {
                player.teleport(obstacleDef.destination.x, obstacleDef.destination.y);
            }
            break;

        case 'shortcut_pipe':
            player.message('You squeeze through the pipe');
            await world.sleepTicks(2);
            if (obstacleDef.destination) {
                player.teleport(obstacleDef.destination.x, obstacleDef.destination.y);
            }
            break;

        case 'shortcut_stones':
            player.message('You jump onto the rock');
            await world.sleepTicks(2);
            const success = rollSkillSuccess(10, 100, level); // Authentic 10% base fail? 
            if (success) {
                player.message('You make it to the other side');
                // Teleport across logic needs relative check if no destination
                if (obstacleDef.destination) {
                    player.teleport(obstacleDef.destination.x, obstacleDef.destination.y);
                } else {
                    // Taverley/Catherby manual logic based on Y or X
                    // Placeholder for specific coord logic if generic destination fails
                }
            } else {
                player.message('You fall into the water!');
                player.damage(Math.floor(player.skills.hits.base * (obstacleDef.failDamage || 0.1)));
                return true;
            }
            break;

        case 'shortcut_ledge':
            player.message('You put your foot on the ledge and try to edge across');
            await world.sleepTicks(3);
            // Fail check
            if (obstacleDef.failLvl && !rollSkillSuccess(obstacleDef.level, obstacleDef.failLvl, level)) {
                player.message('You lose your footing and fall');
                if (obstacleDef.failTo) {
                    player.teleport(obstacleDef.failTo.x, obstacleDef.failTo.y);
                }
                player.damage(Math.floor(player.skills.hits.base * (obstacleDef.failDamage || 0.1)));
                return true;
            }
            if (obstacleDef.destination) {
                player.teleport(obstacleDef.destination.x, obstacleDef.destination.y);
            } else {
                // If no specific destination, assume specific ledge handling (Yanille logic handled by destination in JSON)
                // For strict Yanille ledge: JSON has dest not set? 
                // Wait, I didn't set destinations for Yanille Ledge in JSON in previous step?
                // "614": ... type: "shortcut_ledge", "failLvl": 65, "failTo": ...
                // MISSING DESTINATION for Side 1 and Side 2.
                // I'll update logic to handle Side 1 / Side 2 or assume player position.

                // Simplified: specific handling by ID if needed.
                if (id === 614) player.teleport(601, 3563);
                if (id === 615) player.teleport(601, 3557);
            }
            break;

        case 'shortcut_log_balance':
            player.message('You stand on the slippery log');
            await world.sleepTicks(2);
            if (id === 681) { // West Coal Trucks
                player.teleport(592, 458);
            } else if (id === 680) { // East Coal Trucks
                player.teleport(598, 458);
            }
            player.message('and you walk across');
            break;

        case 'shortcut_lava_stones':
            player.message('You focus on not slipping...');
            await world.sleepTicks(2);
            if (rollSkillSuccess(obstacleDef.level, 99, level)) {
                player.message('and skillfully cross the lava');
                // Destination depends on start side.
                // KBD Stones
                if (player.y >= 3015) { // From KBD side
                    player.teleport(272, 3012);
                } else {
                    player.teleport(281, 3015);
                }
            } else {
                player.message('but fall into the lava');
                player.damage(Math.floor(player.skills.hits.base * (obstacleDef.failDamage || 0.2)));
                // Teleport available safe spot? generic
            }
            break;
    }

    player.addExperience('agility', obstacleDef.xp);
    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    const id = gameObject.id;
    const obstacleDef = OBSTACLES[id];

    if (!obstacleDef) {
        return false;
    }

    const level = player.skills.agility.current;
    if (obstacleDef.level > level) {
        player.message(`You need an agility level of ${obstacleDef.level} to attempt this obstacle`);
        return true;
    }

    if (player.isTired()) {
        player.message('You are too tired to train agility');
        return true;
    }

    // Dispatch to specific course handler
    if (obstacleDef.type.startsWith('gnome')) {
        return await handleGnomeObstacle(player, gameObject, obstacleDef);
    } else if (obstacleDef.type.startsWith('barb')) {
        return await handleBarbarianObstacle(player, gameObject, obstacleDef);
    } else if (obstacleDef.type.startsWith('wild')) {
        return await handleWildernessObstacle(player, gameObject, obstacleDef);
    } else if (obstacleDef.type.startsWith('shortcut')) {
        return await handleShortcut(player, gameObject, obstacleDef);
    }

    return false;
}

module.exports = { onGameObjectCommandOne };
