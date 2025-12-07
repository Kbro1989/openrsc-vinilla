const random = require('random');
const {
    ammunition,
    weapons: rangedWeapons
} = require('@2003scape/rsc-data/ranged');

// { prayerIndex: { skill: 'skill', multiplier: 1.05 }, ... }
const PRAYER_BONUSES = {
    // thick skin
    0: { skill: 'defense', multiplier: 1.05 },
    // burst of strength
    1: { skill: 'strength', multiplier: 1.05 },
    // clarity of thought
    2: { skill: 'attack', multiplier: 1.05 },
    // rock skin
    3: { skill: 'defense', multiplier: 1.1 },
    // superhuman strength
    4: { skill: 'strength', multiplier: 1.1 },
    // improved reflexes
    5: { skill: 'attack', multiplier: 1.1 },
    // steel skin
    9: { skill: 'defense', multiplier: 1.15 },
    // ultimate strength
    10: { skill: 'strength', multiplier: 1.15 },
    // incredible reflexes
    11: { skill: 'attack', multiplier: 1.15 }
};

const STYLE_BONUSES = { strength: 1, attack: 2, defense: 3 };

function getStyleBonus(player, skill) {
    const style = player.combatStyle;

    if (style === 0) { // Controlled
        return 1;
    }

    // Strength (Aggressive) = 1, Attack (Accurate) = 2, Defense (Defensive) = 3
    return STYLE_BONUSES[skill] === style ? 3 : 0;
}

function getPrayerBonuses(player) {
    const bonuses = { defense: 1, strength: 1, attack: 1 };

    for (const [index, enabled] of player.prayers.entries()) {
        if (enabled) {
            const prayer = PRAYER_BONUSES[index];

            if (!prayer) {
                continue;
            }

            bonuses[prayer.skill] = prayer.multiplier;
        }
    }

    return bonuses;
}

// === AUTHENTIC RSC FORMULAS (Ported from OpenRSC CombatFormula.java) ===

/**
 * Calculates an accuracy check (base method)
 * @param {number} accuracy The accuracy term
 * @param {number} defense The defense term
 * @returns {boolean} True if the attack is a hit
 */
function calculateAccuracy(accuracy, defense) {
    let hitChance;
    if (accuracy > defense) {
        hitChance = 1 - ((defense + 2) / (2 * (accuracy + 1)));
    } else {
        hitChance = accuracy / (2 * (defense + 1));
    }

    return Math.random() <= hitChance;
}

/**
 * Gets the melee accuracy of the attacking mob
 */
function getMeleeAccuracy(player) {
    const styleBonus = getStyleBonus(player, 'attack');
    const prayerBonus = getPrayerBonuses(player).attack;
    const attackLevel = player.skills.attack.current;
    
    const bonusConstant = 8; // Player constant
    const weaponAim = player.equipmentBonuses.weaponAim || 0;

    // Formula: (floor(attack * prayer) + constant + style) * (aim + 64)
    return (Math.floor(attackLevel * prayerBonus) + bonusConstant + styleBonus) * (weaponAim + 64);
}

/**
 * Gets the melee defense of the defending mob
 */
function getMeleeDefense(player) {
    const styleBonus = getStyleBonus(player, 'defense');
    const prayerBonus = getPrayerBonuses(player).defense;
    const defenseLevel = player.skills.defense.current;

    const bonusConstant = 8; // Player constant
    const armourPoints = player.equipmentBonuses.armour || 0;

    // Formula: (floor(defense * prayer) + constant + style) * (armour + 64)
    return (Math.floor(defenseLevel * prayerBonus) + bonusConstant + styleBonus) * (armourPoints + 64);
}

function getNPCDefense(npc) {
    const defenseLevel = npc.skills.defense.current;
    const bonusConstant = 0; // NPC constant
    const armourPoints = 0; // Most NPCs have 0 armour bonus, or it's built into stats

    return (defenseLevel + bonusConstant) * (armourPoints + 64);
}

function getNPCAccuracy(npc) {
    const attackLevel = npc.skills.attack.current;
    const bonusConstant = 0;
    const weaponAim = 0;

    return (attackLevel + bonusConstant) * (weaponAim + 64);
}

/**
 * Gets the melee max roll (not max hit) of the attacking mob.
 * Effective Max Hit ~= MaxRoll / 640
 */
function getMeleeMaxRoll(player) {
    const styleBonus = getStyleBonus(player, 'strength');
    const prayerBonus = getPrayerBonuses(player).strength;
    const strengthLevel = player.skills.strength.current;

    const bonusConstant = 8;
    const weaponPower = player.equipmentBonuses.weaponPower || 0;

    // Formula: (floor(str * prayer) + constant + style) * (power + 64)
    return (Math.floor(strengthLevel * prayerBonus) + bonusConstant + styleBonus) * (weaponPower + 64);
}

function getNPCMaxRoll(npc) {
    const strengthLevel = npc.skills.strength.current;
    const bonusConstant = 0;
    const weaponPower = 0; // NPCs usually rely on raw stats

    return (strengthLevel + bonusConstant) * (weaponPower + 64);
}

/**
 * Gets a dice roll for melee damage for a single attack
 * @param {number} maxRoll The max roll from getMeleeMaxRoll
 * @returns {number} The damage dealt
 */
function calculateMeleeDamage(maxRoll) {
    if (maxRoll <= 0) return 0;
    // (random(maxRoll) + 320) / 640
    return Math.floor((Math.floor(Math.random() * maxRoll) + 320) / 640);
}

// === RANGED FORMULAS ===

function getRangedAccuracy(player) {
    const rangedLevel = player.skills.ranged.current;
    const bonusConstant = 8;
    
    // Ranged Aim comes from weapon (bow) + ammo (arrow)
    // In RSC data, 'weaponAim' usually combines these or is on the bow
    const rangedAim = player.equipmentBonuses.weaponAim || 0; 
    // Note: OpenRSC calculates aim based on Bow ID + Arrow ID tables. 
    // Assuming equipmentBonuses.weaponAim is populated correctly from items.json

    // Formula: (level + constant) * (aim + 64)
    // Note: OpenRSC adds +1 to aim in some places, but +64 is the big factor.
    return (rangedLevel + bonusConstant) * (rangedAim + 64);
}

function getRangedMaxRoll(player) {
    const rangedLevel = player.skills.ranged.current;
    const bonusConstant = 8;
    const rangedPower = player.equipmentBonuses.weaponPower || 0;

    // Formula: (level + constant) * (power + 64)
    return (rangedLevel + bonusConstant) * (rangedPower + 64);
}

function calculateRangedDamage(maxRoll) {
    if (maxRoll <= 0) return 0;
    return Math.floor((Math.floor(Math.random() * maxRoll) + 320) / 640);
}

// === MAGIC FORMULAS ===

function calculateMagicDamage(maxHit) {
    // simple random 0 to maxHit
    return Math.floor(Math.random() * (maxHit + 1));
}

// === EXPORTED FUNCTIONS ===

function rollPlayerNPCDamage(player, npc) {
    const accuracy = getMeleeAccuracy(player);
    const defense = getNPCDefense(npc);

    if (calculateAccuracy(accuracy, defense)) {
        const maxRoll = getMeleeMaxRoll(player);
        return calculateMeleeDamage(maxRoll);
    }
    return 0;
}

function rollPlayerPlayerDamage(player, targetPlayer) {
    const accuracy = getMeleeAccuracy(player);
    const defense = getMeleeDefense(targetPlayer);

    if (calculateAccuracy(accuracy, defense)) {
        const maxRoll = getMeleeMaxRoll(player);
        return calculateMeleeDamage(maxRoll);
    }
    return 0;
}

function rollNPCDamage(npc, player) {
    const accuracy = getNPCAccuracy(npc);
    const defense = getMeleeDefense(player);

    if (calculateAccuracy(accuracy, defense)) {
        const maxRoll = getNPCMaxRoll(npc);
        return calculateMeleeDamage(maxRoll);
    }
    return 0;
}

function rollPlayerNPCRangedDamage(player, npc) {
    const accuracy = getRangedAccuracy(player);
    const defense = getNPCDefense(npc); // Ranged checks against melee defense in RSC

    if (calculateAccuracy(accuracy, defense)) {
        const maxRoll = getRangedMaxRoll(player);
        return calculateRangedDamage(maxRoll);
    }
    return 0;
}

function rollNPCMagicDamage(npc, player, spellMaxHit) {
    // Magic accuracy check (simplified as OpenRSC magic accuracy is complex/spell-dependent)
    // Using a basic check similar to melee for now, but magic usually checks against Magic Defense (which is often just Magic level or Defense level)
    // OpenRSC: Magic accuracy depends on spell level vs target magic level/defense.
    // For now, we'll assume a hit if the simplified check passes, or just random.
    // Authentic RSC magic often failed based on level difference.
    
    // Placeholder: 50% chance + level scaling?
    // Let's use the old simplified check for accuracy but authentic damage
    const accuracy = npc.skills.attack.current * 64; // rough approximation
    const defense = getMeleeDefense(player); // Magic often checked melee defense in early RSC or had its own.
    
    // TODO: Implement authentic Magic Accuracy (requires MagicCombat.java analysis)
    // For now, use the previous logic's style but with new damage
    
    const hitChance = 0.5; // Placeholder
    if (Math.random() <= hitChance) {
        return calculateMagicDamage(spellMaxHit);
    }
    return 0;
}

function rollPlayerNPCMagicDamage(player, npc, spellMaxHit, spellName) {
    // Magic accuracy is complex. OpenRSC uses castSpell(def, level, equip) for success.
    // But that's for CASTING success (splash).
    // Combat spells:
    // Accuracy = (MagicLevel + 8) * (MagicAim + 64)
    // Defense = (DefenseLevel + 8) * (64) (for NPCs)
    
    const magicLevel = player.skills.magic.current;
    const magicAim = player.equipmentBonuses.magic || 0;
    const accuracy = (magicLevel + 8) * (magicAim + 64);
    
    const defenseLevel = npc.skills.defense.current;
    const defense = (defenseLevel + 8) * 64;

    if (calculateAccuracy(accuracy, defense)) {
        let maxHit = spellMaxHit;

        // God Spell Charge Boost
        if (player.charged && player.charged > Date.now()) {
            const godCapes = {
                'Claws of Guthix': 17741,
                'Saradomin strike': 17742,
                'Flames of Zamorak': 17743
            };

            if (godCapes[spellName]) {
                const cape = player.inventory.items.find(i => i.equip === 'cape');
                if (cape && cape.id === godCapes[spellName]) {
                    maxHit = 25;
                }
            }
        }

        const damage = calculateMagicDamage(maxHit);

        // God Spell Side Effects
        if (damage > 0) {
            if (spellName === 'Claws of Guthix') {
                const current = npc.skills.defense.current;
                const base = npc.definition.stats.defense;
                const min = Math.floor(base * 0.95);
                if (current > min) {
                    npc.skills.defense.current = Math.max(min, current - (1 + Math.floor(current * 0.05)));
                }
            } else if (spellName === 'Flames of Zamorak') {
                if (npc.skills.magic) {
                    const current = npc.skills.magic.current;
                    const base = npc.definition.stats.magic || 1;
                    const min = Math.floor(base * 0.95);
                    if (current > min) {
                        npc.skills.magic.current = Math.max(min, current - (1 + Math.floor(current * 0.05)));
                    }
                }
            }
        }
        return damage;
    }
    return 0;
}

module.exports = {
    rollPlayerNPCDamage,
    rollPlayerPlayerDamage,
    rollNPCDamage,
    rollPlayerNPCRangedDamage,
    rollNPCMagicDamage,
    rollPlayerNPCMagicDamage,
    // Export helpers for testing/verification
    getMeleeAccuracy,
    getMeleeDefense,
    getMeleeMaxRoll,
    calculateAccuracy,
    calculateMeleeDamage
};
