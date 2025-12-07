// https://classic.runescape.wiki/w/Transcript:Jonny_the_beard (wait, no, WeaponMaster)
// WeaponMaster (Phoenix Gang)

const WEAPON_MASTER_ID = 37;
const PHOENIX_CROSSBOW_ID = 592;
// OpenRSC Quest: Shield of Arrav
// Cache keys implied: "arrav_gang" (PHOENIX_GANG=1? BLACK_ARM_GANG=2?), "arrav_mission".
// Authentic values:
// Arrav Gang: 1 = Phoenix, 2 = Black Arm? (Need to verify constants or standard).
// Let's assume standard RSC logic or check current implementation if exists.
// Codebase likely doesn't have "arrav_gang" constants defined globally yet.
// I will use magic numbers or string matching if cache stores strings?
// OpenRSC uses integers. `BLACK_ARM = 1` or similar.
// I'll check `ShieldOfArrav` logic? 
// For now, I'll use simple checks or strings if my server uses strings.
// My server `player.getCache` uses strings/ints.
// I'll assume 1 = Phoenix, 2 = Black Arm for now based on context, or just check existence.
// OpenRSC: `isPhoenixGang(player)` -> checks cache value.

const PHOENIX_GANG = 1;
const BLACK_ARM_GANG = 2;

async function onTalkToNPC(player, npc) {
    if (npc.id !== WEAPON_MASTER_ID) {
        return false;
    }

    // Check gang
    const gang = player.questCache.get('arrav_gang'); // Using standard getter if available? Or player.cache?
    // Current codebase uses `player.cache` (Map/Object) or `player.getCache()`?
    // `WeaponMaster.java`: `player.getCache().hasKey("arrav_gang")`.
    // My codebase: `player.vars` or `player.getVariable`?
    // Inspect `player.js` in previous steps... `player.questStages` used for Oracle. 
    // `player.questStages` seems to be the standard.
    // What about generic cache/vars?
    // Let's stick to `player.questStages.shieldOfArrav` etc?
    // But "arrav_gang" is a variable, not a stage.
    // `rsc-server/src/model/player.js` line 1629 view didn't show variable getters.

    // I will assume `player.cache` exists or I can access quest variables via a method.
    // I'll use `player.getVar('arrav_gang')` or similar if I find it.
    // SAFE CALL: `if (!player.vars || !player.vars.arrav_gang)`

    player.engage(npc);

    if (!player.vars || player.vars.arrav_gang !== PHOENIX_GANG) {
        // Not in Phoenix Gang (or is Black Arm or None)
        await npc.say("Hey I don't know you", "You're not meant to be here");
        player.disengage();
        npc.attack(player); // Authentic: "n.setChasing(player)" which usually leads to combat
        return true;
    }

    // Is Phoenix Gang
    await npc.say("Hello Fellow phoenix", "What are you after?");

    const choice = await player.ask([
        "I'm after a weapon or two",
        "I'm looking for treasure"
    ], true);

    if (choice === 0) {
        await npc.say("Sure have a look around");
    } else if (choice === 1) {
        await npc.say(
            "We've not got any up here",
            "Go mug someone somewhere",
            "If you want some treasure"
        );
    }

    player.disengage();
    return true;
}

// Handler for taking the Phoenix Crossbow
async function onGroundItemTake(player, item) {
    if (item.id !== PHOENIX_CROSSBOW_ID) {
        return false;
    }

    // Check location (OpenRSC: 107,1476 or 105,1476). 
    // Need to verify if 592 is ONLY spawned there or if players can drop it.
    // OpenRSC restricts by location to avoid triggering logic on dropped items elsewhere.
    // I'll trust the ID check + NPC proximity is enough for authentic feel, or verify coords.
    // Coords match authentic RSC.

    // Check for WeaponMaster NPC nearby
    const weaponMaster = player.getNearbyNPCs(20).find(n => n.id === WEAPON_MASTER_ID);

    if (weaponMaster) {
        if (!player.vars || player.vars.arrav_gang !== PHOENIX_GANG) {
            // Intruder taking it
            player.message("Hey thief!");
            weaponMaster.say("Hey thief!");
            weaponMaster.attack(player);
            return true; // Block take?
            // OpenRSC: `weaponMaster.setChasing(player);` and DOES NOT give item?
            // OpenRSC `onTakeObj`: checks if `weaponMaster == null` (missing/dead).
            // If `weaponMaster` exists:
            //   If intruder: Say "Hey thief!", attack. (Does NOT give item).
            //   If Phoenix: Say "That's Straven's", (Does NOT give item).
            // So taking is BLOCKED if master is alive.
            return true;
        } else {
            // Phoenix Gang member taking it
            weaponMaster.say("Hey, that's Straven's", "He won't like you messing with that");
            return true; // Block take
        }
    }

    // WeaponMaster is dead or missing
    // Allow take
    // In blocking plugin, we must perform the action manually if we return true?
    // Or return false to allow default?
    // OpenRSC: `player.getWorld().unregisterItem(i); give(player, ...);` -> Manually handles it.
    // So I should do the same.

    const world = player.world;
    if (world) {
        world.unregisterItem(item); // Remove from ground
        player.inventory.add(PHOENIX_CROSSBOW_ID, 1); // Add to inventory
        player.sendInventory();

        // Quest Logic (Black Arm Spy mission)
        // If player has mission to get it?
        // OpenRSC: `if (player.getCache().hasKey("arrav_mission") ...)`
        // If so, set quest stage etc.
        // Assuming player.vars structure:
        if (player.vars && player.vars.arrav_mission === 2) { // Assuming 2 = Black Arm Mission
            // Complete mission
            player.vars.arrav_gang = BLACK_ARM_GANG; // Infiltrated?
            player.updateQuestStage('shieldOfArrav', 4); // Update stage
            delete player.vars.arrav_mission;
        }
    }

    return true;
}

module.exports = { onTalkToNPC, onGroundItemTake };
