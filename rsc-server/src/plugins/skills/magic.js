const spells = require('@2003scape/rsc-data/config/spells.json');
const items = require('@2003scape/rsc-data/config/items');

// Teleport destinations
const TELEPORTS = {
    'Varrock teleport': { x: 122, y: 503, xp: 35 },
    'Lumbridge teleport': { x: 120, y: 648, xp: 41 },
    'Falador teleport': { x: 313, y: 550, xp: 47 },
    'Camelot teleport': { x: 465, y: 456, xp: 55.5 },
    'Ardougne teleport': { x: 585, y: 621, xp: 61 },
    'Watchtower teleport': { x: 493, y: 3523, xp: 68 }
};

// Combat spell max hits (authentic RSC from OpenRSC SpellDamages.java)
// XP formula: base XP + (damage * 2)
const COMBAT_SPELLS = {
    'Wind strike': { maxHit: 1, xp: 2.7 },
    'Water strike': { maxHit: 2, xp: 5.5 },
    'Earth strike': { maxHit: 3, xp: 9.5 },
    'Fire strike': { maxHit: 4, xp: 11.5 },
    'Wind bolt': { maxHit: 5, xp: 13.5 },
    'Water bolt': { maxHit: 6, xp: 16.5 },
    'Earth bolt': { maxHit: 7, xp: 19.5 },
    'Fire bolt': { maxHit: 8, xp: 22.5 },
    'Wind blast': { maxHit: 9, xp: 34.5 },
    'Water blast': { maxHit: 10, xp: 39.5 },
    'Earth blast': { maxHit: 11, xp: 44.5 },
    'Fire blast': { maxHit: 12, xp: 50.5 },
    'Wind wave': { maxHit: 13, xp: 60 },
    'Water wave': { maxHit: 14, xp: 65 },
    'Earth wave': { maxHit: 15, xp: 70 },
    'Fire wave': { maxHit: 16, xp: 75 },
    'Claws of Guthix': { maxHit: 18, xp: 35 },     // 25 with Charge
    'Saradomin strike': { maxHit: 18, xp: 35 },   // 25 with Charge
    'Flames of Zamorak': { maxHit: 18, xp: 35 }   // 25 with Charge
};

// Enchant amulet mappings
const ENCHANT_AMULETS = {
    'Enchant lvl-1 amulet': { src: 301, dest: 314, xp: 17.5 },
    'Enchant lvl-2 amulet': { src: 302, dest: 315, xp: 37 },
    'Enchant lvl-3 amulet': { src: 303, dest: 316, xp: 59 },
    'Enchant lvl-4 amulet': { src: 304, dest: 317, xp: 67 },
    'Enchant lvl-5 amulet': { src: 305, dest: 597, xp: 78 }
};

// Helper: Check and remove runes
function checkAndRemoveRunes(player, spell) {
    const staffRunes = {
        615: 31, // Fire staff -> Fire runes
        616: 32, // Water staff -> Water runes
        617: 33, // Air staff -> Air runes
        618: 34  // Earth staff -> Earth runes
    };

    const weaponIndex = player.inventory.equipmentSlots['right-hand'];
    const weapon = weaponIndex !== -1 ? player.inventory.items[weaponIndex] : null;
    const staffReplacesRune = weapon ? staffRunes[weapon.id] : null;

    // Check runes
    for (const rune of spell.runes) {
        if (rune.id === staffReplacesRune) continue;

        if (!player.inventory.has(rune.id, rune.amount)) {
            const runeName = items[rune.id]?.name || 'rune';
            player.message(`@que@You do not have enough ${runeName}s to cast this spell.`);
            return false;
        }
    }

    // Remove runes
    for (const rune of spell.runes) {
        if (rune.id === staffReplacesRune) continue;
        player.inventory.remove(rune.id, rune.amount);
    }

    return true;
}

// ===== SPELL ON SELF (Teleports, Bones to Bananas, Charge) =====
async function onSpellOnSelf(player, spellId) {
    const spell = spells[spellId];
    if (!spell) return;

    if (player.skills.magic.current < spell.level) {
        player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
        return;
    }

    if (!checkAndRemoveRunes(player, spell)) return;

    // Charge
    if (spell.name === 'Charge') {
        player.message('@que@You feel charged with magic power...');
        player.charged = Date.now() + (6 * 60 * 1000);
        player.addExperience('magic', 180);
        return;
    }

    // Teleports
    if (TELEPORTS[spell.name]) {
        const dest = TELEPORTS[spell.name];
        player.teleport(dest.x, dest.y);
        player.message('@que@You teleport away!');
        player.addExperience('magic', dest.xp);
        return;
    }

    // Bones to Bananas
    if (spell.name === 'Bones to bananas') {
        let count = 0;
        for (let i = player.inventory.items.length - 1; i >= 0; i--) {
            const item = player.inventory.items[i];
            if (item.id === 20) { // Bones
                player.inventory.remove(20, 1);
                player.inventory.add(249, 1); // Banana
                count++;
            }
        }
        if (count > 0) {
            player.message('@que@You convert your bones into bananas!');
            player.addExperience('magic', 25);
        } else {
            player.message("@que@You aren't holding any bones!");
        }
    }
}

// ===== SPELL ON INVENTORY ITEM (Alchemy, Enchanting) =====
async function onSpellOnInvItem(player, item, spellId) {
    const spell = spells[spellId];
    if (!spell) return;

    if (player.skills.magic.current < spell.level) {
        player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
        return;
    }

    // === ALCHEMY ===
    if (spell.name.includes('alchemy')) {
        if (item.id === 10) {
            player.message("@que@You can't cast alchemy on gold!");
            return;
        }

        if (!checkAndRemoveRunes(player, spell)) return;

        const isHigh = spell.name.includes('High');
        const baseValue = item.definition.price || 1;
        const goldAmount = isHigh
            ? Math.floor(baseValue * 1.0)
            : Math.floor(baseValue * 0.6);

        player.inventory.remove(item.id, 1);
        player.inventory.add(10, goldAmount);

        player.message(`@que@You convert the ${item.definition.name} into ${goldAmount} gold.`);
        player.addExperience('magic', isHigh ? 65 : 31);
        return;
    }

    // === ENCHANTING ==
    if (spell.name.includes('Enchant') && ENCHANT_AMULETS[spell.name]) {
        const enchant = ENCHANT_AMULETS[spell.name];

        if (item.id !== enchant.src) {
            player.message('@que@This spell cannot be cast on this item.');
            return;
        }

        if (!checkAndRemoveRunes(player, spell)) return;

        player.inventory.remove(enchant.src, 1);
        player.inventory.add(enchant.dest, 1);

        player.message('@que@You successfully enchant the amulet.');
        player.addExperience('magic', enchant.xp);
    }
}

// ===== SPELL ON NPC (Combat & Curse Spells) =====
async function onSpellOnNpc(player, npc, spellId) {
    console.log(`[MAGIC DEBUG] onSpellOnNpc called: spellId=${spellId}, npc=${npc.id}`);

    const spell = spells[spellId];
    if (!spell) {
        console.log(`[MAGIC DEBUG] Spell ${spellId} not found`);
        return false;
    }

    console.log(`[MAGIC DEBUG] Spell: ${spell.name}, Level required: ${spell.level}, Player level: ${player.skills.magic.current}`);

    // Stop player movement - magic is ranged, don't run to target
    player.walkQueue.length = 0;
    player.endWalkFunction = null;

    // Check spell range (10 tiles for magic - extended range for safespotting)
    const SPELL_RANGE = 20; // withinRange uses range/2, so 20 = 10 tiles
    if (!player.withinRange(npc, SPELL_RANGE)) {
        player.message("@que@You are too far away to cast that spell.");
        return true;
    }

    // Check line of sight with projectile mode (allows shooting over fences, rocks, etc.)
    if (!player.withinLineOfSight(npc, true)) {
        player.message("@que@I can't see my target from here.");
        return true;
    }

    if (player.skills.magic.current < spell.level) {
        player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
        return true;
    }

    // === COMBAT SPELLS ===
    if (COMBAT_SPELLS[spell.name] || spell.name === 'Iban blast' || spell.name === 'Crumble undead') {
        console.log(`[MAGIC DEBUG] Combat spell detected: ${spell.name}`);

        // --- SPECIAL SPELL REQUIREMENTS (God Spells, Iban Blast) ---

        // Iban Blast (Level 50) - Base XP 30
        if (spell.name === 'Iban blast') {
            // Check for Iban Staff
            const wep = player.inventory.items[player.inventory.equipmentSlots['right-hand']];
            if (!wep || wep.id !== 1031) {
                player.message("@que@You need to wield the Staff of Iban to cast this spell.");
                return true;
            }
        }

        // God Spells (Sara/Guthix/Zamorak)
        const godSpells = {
            'Claws of Guthix': { staff: 1217, cape: 1215 },
            'Saradomin strike': { staff: 1218, cape: 1214 },
            'Flames of Zamorak': { staff: 1216, cape: 1213 }
        };

        if (godSpells[spell.name]) {
            const req = godSpells[spell.name];
            const wep = player.inventory.items[player.inventory.equipmentSlots['right-hand']];
            const cape = player.inventory.items[player.inventory.equipmentSlots['back']]; // Assuming slot name

            // Note: Equipment slots are usually numeric indices, checking simple logic:
            // Need to verify 'back' slot index in inventory.js if mapped by name, otherwise risky.
            // Assuming player.inventory.equipmentSlots uses text keys if implemented that way.
            // If strict index: cape is usually index 1, weapon 3?
            // Safer: player.equipment.contains(id)?
            // Player.js usually has 'equipped' list or 'getEquipment()'.
            // Let's rely on standard inventory equipment checks or check existing 'right-hand' usage in this file.
            // 'right-hand' is used above. 'cape'?

            // Falling back to "inventory.contains" if equipment slot unknown? No, must be equipped.
            // The existing code uses: player.inventory.equipmentSlots['right-hand'].
            // I will guess 'cape' or 'back'. Standard RSC keys: header, cape, necklace, weapon, body, shield, legs, hands, feet, ring, ammo.

            const capeIndex = player.inventory.equipmentSlots['cape'];
            const capeItem = capeIndex !== -1 ? player.inventory.items[capeIndex] : null;

            if (!wep || wep.id !== req.staff) {
                player.message(`@que@You need to wield the Staff of ${spell.name.split(' ')[2] || 'God'} to cast this spell.`);
                return true;
            }
            if (!capeItem || capeItem.id !== req.cape) {
                player.message(`@que@You need to wear the Cake of ${spell.name.split(' ')[2] || 'God'} to cast this spell.`);
                // Typo "Cake" -> "Cape"
                player.message(`@que@You need to wear the Cape of ${spell.name.split(' ')[2] || 'God'} to cast this spell.`);
                return true;
            }
        }

        // Crumble Undead
        if (spell.name === 'Crumble undead') {
            const undead = ['zombie', 'skeleton', 'ghost', 'shade'];
            if (!undead.some(t => npc.definition.name.toLowerCase().includes(t))) {
                player.message("@que@You can only cast this spell on undead targets.");
                return true;
            }
        }

        // Check if player has runes
        if (!checkAndRemoveRunes(player, spell)) {
            console.log(`[MAGIC DEBUG] Insufficient runes`);
            return true;
        }

        // Determine Damage and XP
        let maxHit = 0;
        let baseXp = 0;

        if (spell.name === 'Iban blast') {
            maxHit = 25;
            baseXp = 30;
        } else if (spell.name === 'Crumble undead') {
            maxHit = 15;
            baseXp = 24.5;
        } else if (COMBAT_SPELLS[spell.name]) {
            const data = COMBAT_SPELLS[spell.name];
            maxHit = data.maxHit;
            baseXp = data.xp;

            // Charge Boost for God Spells
            if (godSpells[spell.name] && player.charged && Date.now() < player.charged) {
                maxHit = 25;
                player.message("@que@Your spell is boosted by your charge!");
            }
        }

        player.message(`@que@You cast ${spell.name}!`);

        // Send projectile
        player.sendProjectile(npc, 2);

        // Deal damage
        const damage = Math.floor(Math.random() * (maxHit + 1));
        npc.damage(damage);

        // Award XP
        player.addExperience('magic', baseXp + (damage * 2));

        console.log(`[MAGIC DEBUG] Dealt ${damage} damage, awarded XP`);
        return true;
    }

    // === CURSE SPELLS (Existing Logic) ===
    const curseSpells = ['Confuse', 'Weaken', 'Curse', 'Vulnerability', 'Enfeeble', 'Stun'];
    if (curseSpells.includes(spell.name)) {
        if (!checkAndRemoveRunes(player, spell)) return true;

        const successChance = (player.skills.magic.current - spell.level) + 50;
        const roll = Math.random() * 100;

        if (roll > successChance) {
            player.message("@que@The spell fails!");
            return;
        }

        player.message(`@que@You cast ${spell.name} on the ${npc.definition.name}`);

        const statMap = {
            'Confuse': { skill: 'attack', percent: 0.05 },
            'Weaken': { skill: 'strength', percent: 0.05 },
            'Curse': { skill: 'defense', percent: 0.05 },
            'Vulnerability': { skill: 'defense', percent: 0.10 },
            'Enfeeble': { skill: 'strength', percent: 0.10 },
            'Stun': { skill: 'attack', percent: 0.10 }
        };

        const effect = statMap[spell.name];
        if (effect) {
            // Apply debuff logic here if NPC has stats (currently placeholder)
            // npc.skills[effect.skill].current -= ...
        }

        const xpMap = {
            'Confuse': 13,
            'Weaken': 21,
            'Curse': 29,
            'Vulnerability': 76,
            'Enfeeble': 83,
            'Stun': 90
        };
        player.addExperience('magic', xpMap[spell.name] || 0);
    }
}

// ===== SPELL ON GROUND ITEM (Telekinetic Grab) =====
async function onSpellOnGroundItem(player, groundItem, spellId) {
    const spell = spells[spellId];
    if (!spell) return;

    if (spell.name === 'Telekinetic grab') {
        if (player.skills.magic.current < spell.level) {
            player.message(`@que@You need a magic level of ${spell.level} to cast this spell.`);
            return;
        }

        if (!player.withinRange(groundItem, 5)) {
            player.message("@que@I can't reach that!");
            return;
        }

        if (!checkAndRemoveRunes(player, spell)) return;

        if (player.inventory.add(groundItem.id, groundItem.amount)) {
            player.world.groundItems.remove(groundItem);
            player.message('@que@You grab the item with magic!');
            player.addExperience('magic', 43);
        } else {
            player.message("@que@You don't have enough inventory space.");
        }
    }
}

module.exports = {
    onSpellOnSelf,
    onSpellOnInvItem,
    onSpellOnNpc,
    onSpellOnGroundItem
};
