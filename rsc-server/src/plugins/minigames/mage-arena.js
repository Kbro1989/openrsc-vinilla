/**
 * Mage Arena Minigame
 * 
 * Deep wilderness minigame to obtain God Spells:
 * - Claws of Guthix
 * - Flames of Zamorak  
 * - Saradomin Strike
 * 
 * Requirements:
 * - 60 Magic minimum
 * - Able to survive deep wilderness
 * 
 * Reward: God staff + God cape + ability to cast God spells
 */

const MINIGAME_NAME = 'Mage Arena';

// NPC IDs
const NPC_KOLODION = 481;
const NPC_BATTLE_MAGE = 482;

// Item IDs
const ITEM_GUTHIX_STAFF = 710;
const ITEM_GUTHIX_CAPE = 711;
const ITEM_ZAMORAK_STAFF = 712;
const ITEM_ZAMORAK_CAPE = 713;
const ITEM_SARADOMIN_STAFF = 714;
const ITEM_SARADOMIN_CAPE = 715;

// God spell constants
const GODS = {
    guthix: {
        name: 'Guthix',
        spell: 'Claws of Guthix',
        staff: ITEM_GUTHIX_STAFF,
        cape: ITEM_GUTHIX_CAPE,
        statueId: 1
    },
    zamorak: {
        name: 'Zamorak',
        spell: 'Flames of Zamorak',
        staff: ITEM_ZAMORAK_STAFF,
        cape: ITEM_ZAMORAK_CAPE,
        statueId: 2
    },
    saradomin: {
        name: 'Saradomin',
        spell: 'Saradomin Strike',
        staff: ITEM_SARADOMIN_STAFF,
        cape: ITEM_SARADOMIN_CAPE,
        statueId: 3
    }
};

function getMageArenaProgress(player) {
    return player.cache.mageArena || {
        started: false,
        defeated: false,
        godChosen: null,
        complete: false
    };
}

function setMageArenaProgress(player, progress) {
    player.cache.mageArena = progress;
}

// Talk to Kolodion to start
async function onTalkToKolodion(player, npc) {
    const progress = getMageArenaProgress(player);

    // Check magic level
    if (player.skills[6] < 60) { // Magic
        await npc.say("You need level 60 Magic to participate");
        return true;
    }

    if (progress.complete) {
        await npc.say("You have mastered a God spell");
        await npc.say("Pray at the other statues if you wish to learn more");
        return true;
    }

    if (!progress.started) {
        await npc.say("Welcome to the Mage Arena");
        await npc.say("Here you can learn the powerful God spells");
        await npc.say("But first you must prove your worth in combat against me");

        const option = await player.ask([
            "I'm ready to fight!",
            "What are the God spells?",
            "Maybe later"
        ], true);

        if (option === 0) {
            progress.started = true;
            setMageArenaProgress(player, progress);
            await npc.say("Very well! Prepare yourself!");
            player.message("Kolodion transforms and attacks you!");
            // Combat would be initiated here
        } else if (option === 1) {
            await npc.say("The three God spells are:");
            await npc.say("Claws of Guthix - drains opponent's defence");
            await npc.say("Flames of Zamorak - reduces opponent's magic");
            await npc.say("Saradomin Strike - reduces opponent's prayer");
            await npc.say("Each requires level 60 Magic and the appropriate staff");
        }
    } else if (!progress.defeated) {
        await npc.say("You must defeat me to proceed!");
        player.message("Kolodion attacks!");
    } else if (!progress.godChosen) {
        await npc.say("Well fought! You have proven yourself");
        await npc.say("Now choose your god!");
        await npc.say("Pray at one of the statues in the chamber");
    }

    return true;
}

// Pray at god statue
function onPrayAtStatue(player, statueId) {
    const progress = getMageArenaProgress(player);

    if (!progress.defeated) {
        player.message("You must defeat Kolodion first");
        return true;
    }

    const god = Object.values(GODS).find(g => g.statueId === statueId);
    if (!god) return false;

    if (progress.godChosen && progress.godChosen !== god.name) {
        // Already chosen a different god, but can learn others
        player.message(`You pray to ${god.name}`);
        player.message(`You can now cast ${god.spell}!`);
        player.inventory.add(god.staff, 1);
        player.inventory.add(god.cape, 1);
        player.message(`You receive the ${god.name} staff and cape`);
        return true;
    }

    if (!progress.godChosen) {
        progress.godChosen = god.name;
        progress.complete = true;
        setMageArenaProgress(player, progress);

        player.message(`You dedicate yourself to ${god.name}`);
        player.message(`You can now cast ${god.spell}!`);
        player.inventory.add(god.staff, 1);
        player.inventory.add(god.cape, 1);
        player.addExperience('magic', 10000 * 4);
        player.message(`You receive the ${god.name} staff and cape`);
        player.message("You gain 10000 Magic XP!");
    }

    return true;
}

// Kill Kolodion
function onKillKolodion(player, npc) {
    const progress = getMageArenaProgress(player);
    if (progress.started && !progress.defeated) {
        progress.defeated = true;
        setMageArenaProgress(player, progress);
        player.message("You have defeated Kolodion!");
        player.message("Go pray at one of the God statues to receive your reward");
    }
    return true;
}

// Command to check progress
function handleMageArenaCommand(player, args) {
    const progress = getMageArenaProgress(player);

    if (!progress.started) {
        player.message("You haven't started the Mage Arena");
        player.message("Find Kolodion in the deep wilderness");
        return true;
    }

    player.message("=== Mage Arena Progress ===");
    player.message(`Kolodion defeated: ${progress.defeated ? 'Yes' : 'No'}`);
    if (progress.godChosen) {
        player.message(`Chosen god: ${progress.godChosen}`);
    }
    if (progress.complete) {
        player.message("Status: COMPLETE");
    }

    return true;
}

module.exports = {
    MINIGAME_NAME,
    GODS,
    getMageArenaProgress,
    setMageArenaProgress,
    onTalkToKolodion,
    onPrayAtStatue,
    onKillKolodion,
    handleMageArenaCommand
};
