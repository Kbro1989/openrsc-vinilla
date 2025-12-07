// https://classic.runescape.wiki/w/Drinks

const BEER_GLASS_ID = 620;
const JUG_ID = 140;

const DRINK_EFFECTS = {
    // https://classic.runescape.wiki/w/Wine
    142: async (player, item) => {
        player.sendBubble(item.id);

        player.skills.attack.current = Math.max(
            0,
            player.skills.attack.base - 3
        );

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 11,
            player.skills.hits.base
        );

        player.sendStats();

        player.inventory.add(JUG_ID);

        player.message('@que@You drink the wine');
        player.message('@que@It makes you feel a bit dizzy');
    },

    // https://classic.runescape.wiki/w/Beer
    193: async (player, item) => {
        player.sendBubble(item.id);

        player.skills.attack.current = Math.max(
            0,
            Math.floor(player.skills.attack.current * 0.94) - 1
        );

        const maxStrength = Math.floor(player.skills.strength.base * 1.02) + 1;

        if (player.skills.strength.current < maxStrength) {
            player.skills.strength.current = maxStrength;
        }

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 1,
            player.skills.hits.base
        );

        player.sendStats();

        player.inventory.add(BEER_GLASS_ID);

        player.message('@que@You drink the beer');
        player.message('@que@You feel slightly reinvigorated');
        player.message('@que@And slightly dizzy too');
    },

    // https://classic.runescape.wiki/w/Asgarnian_Ale
    267: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);
        player.message('@que@You drink the Ale');
        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(2);

        player.skills.attack.current = Math.max(
            0,
            player.skills.attack.current - 4
        );

        const maxStrength = player.skills.strength.base + 2;

        if (player.skills.strength.current < maxStrength) {
            player.skills.strength.current = maxStrength;
        }

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 2,
            player.skills.hits.base
        );

        player.sendStats();

        player.message(
            '@que@You feel slightly reinvigorated',
            '@que@And slightly dizzy too'
        );
    },

    // https://classic.runescape.wiki/w/Cup_of_tea
    739: async (player, item) => {
        player.sendBubble(item.id);
        player.message('@que@You drink the cup of tea');
        // Heals 2% + 2, boosts attack 2% + 2
        const healAmount = Math.floor(player.skills.hits.base * 0.02) + 2;
        player.skills.hits.current = Math.min(player.skills.hits.current + healAmount, player.skills.hits.base);
        const attackBoost = Math.floor(player.skills.attack.base * 0.02) + 2;
        player.skills.attack.current = player.skills.attack.base + attackBoost;
        player.sendStats();
    },

    // https://classic.runescape.wiki/w/Grog
    598: async (player, item) => {
        player.sendBubble(item.id);
        player.inventory.add(BEER_GLASS_ID);
        player.message('@que@You drink the Grog');
        player.message('@que@You feel slightly reinvigorated');
        player.message('@que@And slightly dizzy too');
        // Grog: -6 attack, +3 strength, +3 hp
        player.skills.attack.current = Math.max(0, player.skills.attack.current - 6);
        player.skills.strength.current = player.skills.strength.base + 3;
        player.skills.hits.current = Math.min(player.skills.hits.current + 3, player.skills.hits.base);
        player.sendStats();
    },

    // https://classic.runescape.wiki/w/Khali_brew
    735: async (player, item) => {
        player.sendBubble(item.id);
        player.inventory.add(BEER_GLASS_ID);
        player.message('@que@You drink the Khali brew');
        player.message('@que@It has a strange taste');
        // Khali Brew: -5% attack, +5% thieving
        player.skills.attack.current = Math.max(0, player.skills.attack.current - Math.floor(player.skills.attack.base * 0.05));
        player.skills.thieving.current = player.skills.thieving.base + Math.floor(player.skills.thieving.base * 0.05) + 1;
        player.sendStats();
    },

    // https://classic.runescape.wiki/w/Chocolaty_milk
    770: async (player, item) => {
        player.sendBubble(item.id);
        player.inventory.add(21); // Bucket
        player.message('@que@You drink the chocolaty milk');
        player.skills.hits.current = Math.min(player.skills.hits.current + 4, player.skills.hits.base);
        player.sendStats();
    },

    // https://classic.runescape.wiki/w/Poison_Chalice
    737: async (player, item) => {
        player.sendBubble(item.id);
        const roll = Math.floor(Math.random() * 6);
        if (roll === 0) {
            // Damage 1-3 hp
            const dmg = 1 + Math.floor(Math.random() * 3);
            player.skills.hits.current = Math.max(1, player.skills.hits.current - dmg);
            player.message('@que@That tasted a bit dodgy. You feel a bit ill');
        } else if (roll === 1) {
            // Heal 5%
            const heal = Math.floor(player.skills.hits.base * 0.05);
            player.skills.hits.current = Math.min(player.skills.hits.current + heal, player.skills.hits.base);
            player.message('@que@It heals some health');
        } else if (roll === 2) {
            // +1 crafting, -1 attack/defense
            player.skills.crafting.current = player.skills.crafting.base + 1;
            player.skills.attack.current = Math.max(0, player.skills.attack.current - 1);
            player.skills.defense.current = Math.max(0, player.skills.defense.current - 1);
            player.message('@que@You feel a little strange');
        } else if (roll === 3) {
            // Heal 15%, +1 thieving
            const heal = Math.floor(player.skills.hits.base * 0.15);
            player.skills.hits.current = Math.min(player.skills.hits.current + heal, player.skills.hits.base);
            player.skills.thieving.current = player.skills.thieving.base + 1;
            player.message('@que@You feel a lot better');
        } else if (roll === 4) {
            // Heal 30%, +4 to attack/str/def
            const heal = Math.floor(player.skills.hits.base * 0.30);
            player.skills.hits.current = Math.min(player.skills.hits.current + heal, player.skills.hits.base);
            player.skills.attack.current = player.skills.attack.base + 4;
            player.skills.strength.current = player.skills.strength.base + 4;
            player.skills.defense.current = player.skills.defense.base + 4;
            player.message('@que@Wow that was amazing!! You feel really invigorated');
        } else {
            player.message('@que@It has a slight taste of apricot');
        }
        player.sendStats();
    },

    // https://classic.runescape.wiki/w/Zamorak_potion - Boosts att/str, drains def/hp/prayer
    963: async (player, item) => {
        player.sendBubble(item.id);
        player.inventory.add(964);
        player.message('@que@You drink some of the foul liquid');
        // +20% attack +4, +12% str +2, -10% def -4, -10% hp, +10% prayer
        player.skills.attack.current = player.skills.attack.base + Math.floor(player.skills.attack.base * 0.20) + 4;
        player.skills.strength.current = player.skills.strength.base + Math.floor(player.skills.strength.base * 0.12) + 2;
        player.skills.defense.current = Math.max(0, player.skills.defense.current - Math.floor(player.skills.defense.base * 0.10) - 4);
        player.skills.hits.current = Math.max(1, player.skills.hits.current - Math.floor(player.skills.hits.base * 0.10));
        player.skills.prayer.current = Math.min(player.skills.prayer.current + Math.floor(player.skills.prayer.base * 0.10), player.skills.prayer.base);
        player.sendStats();
        player.message('@que@You have 2 doses of potion left');
    },
    964: async (player, item) => {
        player.sendBubble(item.id);
        player.inventory.add(965);
        player.message('@que@You drink some of the foul liquid');
        player.skills.attack.current = player.skills.attack.base + Math.floor(player.skills.attack.base * 0.20) + 4;
        player.skills.strength.current = player.skills.strength.base + Math.floor(player.skills.strength.base * 0.12) + 2;
        player.skills.defense.current = Math.max(0, player.skills.defense.current - Math.floor(player.skills.defense.base * 0.10) - 4);
        player.skills.hits.current = Math.max(1, player.skills.hits.current - Math.floor(player.skills.hits.base * 0.10));
        player.skills.prayer.current = Math.min(player.skills.prayer.current + Math.floor(player.skills.prayer.base * 0.10), player.skills.prayer.base);
        player.sendStats();
        player.message('@que@You have 1 dose of potion left');
    },
    965: async (player, item) => {
        player.sendBubble(item.id);
        player.inventory.add(465);
        player.message('@que@You drink some of the foul liquid');
        // Last dose has less modifiers
        player.skills.attack.current = player.skills.attack.base + Math.floor(player.skills.attack.base * 0.20) + 2;
        player.skills.strength.current = player.skills.strength.base + Math.floor(player.skills.strength.base * 0.12) + 2;
        player.skills.defense.current = Math.max(0, player.skills.defense.current - Math.floor(player.skills.defense.base * 0.10) - 2);
        player.skills.hits.current = Math.max(1, player.skills.hits.current - Math.floor(player.skills.hits.base * 0.10));
        player.skills.prayer.current = Math.min(player.skills.prayer.current + Math.floor(player.skills.prayer.base * 0.10), player.skills.prayer.base);
        player.sendStats();
        player.message('@que@You have finished your potion');
    },

    // https://classic.runescape.wiki/w/Wizard%27s_Mind_Bomb
    268: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);
        player.message("@que@you drink the Wizard's Mind Bomb");
        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(2);

        for (const skillName of ['attack', 'strength', 'defense']) {
            player.skills[skillName].current = Math.min(
                0,
                player.skills[skillName].current - 2
            );
        }

        player.skills.magic.current =
            player.skills.magic.base +
            2 +
            (player.skills.magic.base >= 50 ? 1 : 0);

        player.sendStats();
        player.message('@que@You feel very strange');
    },

    // https://classic.runescape.wiki/w/Dwarven_Stout
    269: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);

        player.message(
            '@que@You drink the Dwarven Stout',
            '@que@It tastes foul'
        );

        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(3);

        for (const skillName of ['attack', 'strength', 'defense']) {
            player.skills[skillName].current = Math.min(
                0,
                player.skills[skillName].current - 2
            );
        }

        player.skills.mining.current = player.skills.mining.base + 1;
        player.skills.smithing.current = player.skills.smithing.base + 1;

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 1,
            player.skills.hits.base
        );

        player.sendStats();
        player.message('@que@It tastes pretty strong too');
    },

    // Super Attack Potion (3/2/1 dose) - Boosts attack by 15% + 5 (RSC IDs: 486/487/488)
    486: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.15) + 5;
        player.skills.attack.current = player.skills.attack.base + boost;
        player.sendStats();
        player.inventory.add(487);
        player.message('@que@You drink some of your super attack potion');
    },
    487: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.15) + 5;
        player.skills.attack.current = player.skills.attack.base + boost;
        player.sendStats();
        player.inventory.add(488);
        player.message('@que@You drink some of your super attack potion');
        player.message('@que@You have 1 dose of potion left');
    },
    488: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.15) + 5;
        player.skills.attack.current = player.skills.attack.base + boost;
        player.sendStats();
        player.inventory.add(465);
        player.message('@que@You drink some of your super attack potion');
        player.message('@que@You have finished your potion');
    },

    // Attack Potion (3/2/1 dose) - Boosts attack by 10% + 3 (RSC IDs: 474/475/476)
    474: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = player.skills.attack.base + boost;
        player.sendStats();
        player.inventory.add(475);
        player.message('@que@You drink some of your attack potion');
        player.message('@que@You have 2 doses of potion left');
    },
    475: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = player.skills.attack.base + boost;
        player.sendStats();
        player.inventory.add(476);
        player.message('@que@You drink some of your attack potion');
        player.message('@que@You have 1 dose of potion left');
    },
    476: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = player.skills.attack.base + boost;
        player.sendStats();
        player.inventory.add(465);
        player.message('@que@You drink some of your attack potion');
        player.message('@que@You have finished your potion');
    },

    // Defense Potion (3/2/1 dose) - Boosts defense by 10% + 3 (RSC IDs: 480/481/482)
    480: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = player.skills.defense.base + boost;
        player.sendStats();
        player.inventory.add(481);
        player.message('@que@You drink some of your defense potion');
        player.message('@que@You have 2 doses of potion left');
    },
    481: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = player.skills.defense.base + boost;
        player.sendStats();
        player.inventory.add(482);
        player.message('@que@You drink some of your defense potion');
        player.message('@que@You have 1 dose of potion left');
    },
    482: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = player.skills.defense.base + boost;
        player.sendStats();
        player.inventory.add(465);
        player.message('@que@You drink some of your defense potion');
        player.message('@que@You have finished your potion');
    },

    // Restore Prayer Potion (3/2/1 dose) - Restores prayer by 25% + 7 (RSC IDs: 483/484/485)
    483: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(484);
        player.message('@que@You drink some of your restore prayer potion');
        player.message('@que@You have 2 doses of potion left');
    },
    484: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(485);
        player.message('@que@You drink some of your restore prayer potion');
        player.message('@que@You have 1 dose of potion left');
    },
    485: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(465);
        player.message('@que@You drink some of your restore prayer potion');
        player.message('@que@You have finished your potion');
    },

    // Strength Potion (4/3/2/1 dose) - Boosts strength by 10% + 3 (RSC IDs: 221/222/223/224)
    221: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = player.skills.strength.base + boost;
        player.sendStats();
        player.inventory.add(222);
        player.message('@que@You drink some of your strength potion');
        player.message('@que@You have 3 doses of potion left');
    },
    222: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = player.skills.strength.base + boost;
        player.sendStats();
        player.inventory.add(223);
        player.message('@que@You drink some of your strength potion');
        player.message('@que@You have 2 doses of potion left');
    },
    223: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = player.skills.strength.base + boost;
        player.sendStats();
        player.inventory.add(224);
        player.message('@que@You drink some of your strength potion');
        player.message('@que@You have 1 dose of potion left');
    },
    224: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = player.skills.strength.base + boost;
        player.sendStats();
        player.inventory.add(465);
        player.message('@que@You drink some of your strength potion');
        player.message('@que@You have finished your potion');
    },

    // Attack Potion (3/2/1 dose) - Boosts attack by 10% + 3
    1287: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = Math.min(player.skills.attack.base + boost, player.skills.attack.base + boost);
        player.sendStats();
        player.inventory.add(1288); // 2 dose
        player.message('@que@You drink the attack potion');
        player.message('@que@You feel your attack increase');
    },
    1288: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = Math.min(player.skills.attack.base + boost, player.skills.attack.base + boost);
        player.sendStats();
        player.inventory.add(1289); // 1 dose
        player.message('@que@You drink the attack potion');
        player.message('@que@You feel your attack increase');
    },
    1289: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.attack.base * 0.10) + 3;
        player.skills.attack.current = Math.min(player.skills.attack.base + boost, player.skills.attack.base + boost);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the attack potion');
        player.message('@que@You feel your attack increase');
    },

    // Cure poison Potion (3/2/1 dose) - Cures poison
    1290: async (player, item) => {
        player.sendBubble(item.id);
        if (player.isPoisoned) player.isPoisoned = false;
        player.inventory.add(1291); // 2 dose
        player.message('@que@You drink the cure poison potion');
        player.message('@que@You have been cured of poison');
    },
    1291: async (player, item) => {
        player.sendBubble(item.id);
        if (player.isPoisoned) player.isPoisoned = false;
        player.inventory.add(1292); // 1 dose
        player.message('@que@You drink the cure poison potion');
        player.message('@que@You have been cured of poison');
    },
    1292: async (player, item) => {
        player.sendBubble(item.id);
        if (player.isPoisoned) player.isPoisoned = false;
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the cure poison potion');
        player.message('@que@You have been cured of poison');
    },

    // Strength Potion (3/2/1 dose) - Boosts strength by 10% + 3
    1293: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = Math.min(player.skills.strength.base + boost, player.skills.strength.base + boost);
        player.sendStats();
        player.inventory.add(1294); // 2 dose
        player.message('@que@You drink the strength potion');
        player.message('@que@You feel your strength increase');
    },
    1294: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = Math.min(player.skills.strength.base + boost, player.skills.strength.base + boost);
        player.sendStats();
        player.inventory.add(1295); // 1 dose
        player.message('@que@You drink the strength potion');
        player.message('@que@You feel your strength increase');
    },
    1295: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.strength.base * 0.10) + 3;
        player.skills.strength.current = Math.min(player.skills.strength.base + boost, player.skills.strength.base + boost);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the strength potion');
        player.message('@que@You feel your strength increase');
    },

    // Defense Potion (3/2/1 dose) - Boosts defense by 10% + 3
    1296: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = Math.min(player.skills.defense.base + boost, player.skills.defense.base + boost);
        player.sendStats();
        player.inventory.add(1297); // 2 dose
        player.message('@que@You drink the defense potion');
        player.message('@que@You feel your defense increase');
    },
    1297: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = Math.min(player.skills.defense.base + boost, player.skills.defense.base + boost);
        player.sendStats();
        player.inventory.add(1298); // 1 dose
        player.message('@que@You drink the defense potion');
        player.message('@que@You feel your defense increase');
    },
    1298: async (player, item) => {
        player.sendBubble(item.id);
        const boost = Math.floor(player.skills.defense.base * 0.10) + 3;
        player.skills.defense.current = Math.min(player.skills.defense.base + boost, player.skills.defense.base + boost);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the defense potion');
        player.message('@que@You feel your defense increase');
    },

    // Restore prayer Potion (3/2/1 dose) - Restores prayer by (L * 0.25 + 7)
    1299: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(1300); // 2 dose
        player.message('@que@You drink the restore prayer potion');
        player.message('@que@You feel your prayer restore');
    },
    1300: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(1301); // 1 dose
        player.message('@que@You drink the restore prayer potion');
        player.message('@que@You feel your prayer restore');
    },
    1301: async (player, item) => {
        player.sendBubble(item.id);
        const restore = Math.floor(player.skills.prayer.base * 0.25) + 7;
        player.skills.prayer.current = Math.min(player.skills.prayer.current + restore, player.skills.prayer.base);
        player.sendStats();
        player.inventory.add(465); // Empty vial
        player.message('@que@You drink the restore prayer potion');
        player.message('@que@You feel your prayer restore');
    }
};

async function onInventoryCommand(player, item) {
    if (!DRINK_EFFECTS.hasOwnProperty(item.id)) {
        return false;
    }

    player.inventory.remove(item.id);
    await DRINK_EFFECTS[item.id](player, item);

    return true;
}

module.exports = { onInventoryCommand };
