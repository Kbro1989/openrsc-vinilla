

const VIAL_ID = 465;

const POTIONS = {
    // Attack Potion
    221: { name: 'Attack Potion', skill: 'attack', boost: true, percent: 0.10, constant: 3 },
    222: { name: 'Attack Potion', parentId: 221, dose: 2 },
    223: { name: 'Attack Potion', parentId: 221, dose: 1 },

    // Strength Potion
    474: { name: 'Strength Potion', skill: 'strength', boost: true, percent: 0.10, constant: 3 },
    475: { name: 'Strength Potion', parentId: 474, dose: 2 },
    476: { name: 'Strength Potion', parentId: 474, dose: 1 },

    // Restore Potion
    477: { name: 'Restore Potion', type: 'restore' },
    478: { name: 'Restore Potion', parentId: 477, dose: 2 },
    479: { name: 'Restore Potion', parentId: 477, dose: 1 },

    // Prayer Potion
    480: { name: 'Prayer Potion', type: 'prayer', percent: 0.25, constant: 7 },
    481: { name: 'Prayer Potion', parentId: 480, dose: 2 },
    482: { name: 'Prayer Potion', parentId: 480, dose: 1 },

    // Super Attack Potion
    483: { name: 'Super Attack Potion', skill: 'attack', boost: true, percent: 0.15, constant: 5 },
    484: { name: 'Super Attack Potion', parentId: 483, dose: 2 },
    485: { name: 'Super Attack Potion', parentId: 483, dose: 1 },

    // Fishing Potion
    486: { name: 'Fishing Potion', skill: 'fishing', boost: true, percent: 0, constant: 3 },
    487: { name: 'Fishing Potion', parentId: 486, dose: 2 },
    488: { name: 'Fishing Potion', parentId: 486, dose: 1 },

    // Super Strength Potion
    489: { name: 'Super Strength Potion', skill: 'strength', boost: true, percent: 0.15, constant: 5 },
    490: { name: 'Super Strength Potion', parentId: 489, dose: 2 },
    491: { name: 'Super Strength Potion', parentId: 489, dose: 1 },

    // Super Defense Potion
    492: { name: 'Super Defense Potion', skill: 'defense', boost: true, percent: 0.15, constant: 5 },
    493: { name: 'Super Defense Potion', parentId: 492, dose: 2 },
    494: { name: 'Super Defense Potion', parentId: 492, dose: 1 },

    // Ranging Potion
    495: { name: 'Ranging Potion', skill: 'ranged', boost: true, percent: 0.10, constant: 4 },
    496: { name: 'Ranging Potion', parentId: 495, dose: 2 },
    497: { name: 'Ranging Potion', parentId: 495, dose: 1 },
};

async function onInventoryCommand(player, item) {
    const potion = POTIONS[item.id];
    if (!potion) {
        return false;
    }

    const { world } = player;
    const parentPotion = potion.parentId ? POTIONS[potion.parentId] : potion;
    const dose = potion.dose || 3;

    player.sendBubble(item.id);
    player.message(`@que@You drink some of your ${parentPotion.name}`);

    // Apply Effects
    if (parentPotion.type === 'restore') {
        ['attack', 'strength', 'defense', 'ranged', 'magic'].forEach(skill => {
            if (player.skills[skill].current < player.skills[skill].base) {
                player.skills[skill].current = player.skills[skill].base;
            }
        });
    } else if (parentPotion.type === 'prayer') {
        const restoreAmount = Math.floor(player.skills.prayer.base * parentPotion.percent) + parentPotion.constant;
        player.skills.prayer.current = Math.min(
            player.skills.prayer.base,
            player.skills.prayer.current + restoreAmount
        );
    } else if (parentPotion.skill) {
        const current = player.skills[parentPotion.skill].current;
        const base = player.skills[parentPotion.skill].base;
        const boostAmount = Math.floor(base * parentPotion.percent) + parentPotion.constant;

        // Only boost if not already boosted above the new max
        if (current < base + boostAmount) {
            player.skills[parentPotion.skill].current = base + boostAmount;
        }
    }

    player.sendStats();
    player.inventory.remove(item.id);

    if (dose > 1) {
        player.inventory.add(item.id + 1); // Next dose down
        player.message(`@que@You have ${dose - 1} dose${dose - 1 > 1 ? 's' : ''} left`);
    } else {
        player.inventory.add(VIAL_ID);
        player.message(`@que@You have finished the potion`);
    }

    await world.sleepTicks(2);
    return true;
}

module.exports = { onInventoryCommand };
