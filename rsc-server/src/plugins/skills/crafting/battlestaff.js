const items = require('@2003scape/rsc-data/config/items');
const { battlestaves } = require('@2003scape/rsc-data/skills/crafting');

const BATTLESTAFF_ID = 614;

module.exports = {
    onUseWithInventory: async (player, item1, item2) => {
        // Check if one item is Battlestaff and the other is a powered Orb in the list
        let staff = null;
        let orb = null;

        if (item1.id === BATTLESTAFF_ID) {
            staff = item1;
            orb = item2;
        } else if (item2.id === BATTLESTAFF_ID) {
            staff = item2;
            orb = item1;
        }

        if (staff && battlestaves[orb.id]) {
            const def = battlestaves[orb.id];

            if (player.skills.crafting.current < def.level) {
                player.message(`You need a crafting level of ${def.level} to attach this orb`);
                return true;
            }

            player.message('@que@You attach the orb to the battlestaff'); // Verify authentic msg?
            await player.world.sleepTicks(2);

            player.inventory.remove(orb);
            player.inventory.remove(staff);
            player.inventory.add(def.id);
            player.addExperience('crafting', def.experience);
            return true;
        }

        return false;
    }
};
