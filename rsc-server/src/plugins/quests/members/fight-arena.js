const QUEST_NAME = 'Fight Arena';
const QUEST_POINTS = 2;

// NPC IDs
const NPC_LADY_SERVIL = 310;
const NPC_JEREMY_SERVIL = 311;
const NPC_JUSTIN_SERVIL = 312;
const NPC_GENERAL_KHAZARD = 313;
const NPC_BOUNCER = 314;
const NPC_KHAZARD_GUARD = 315; // Standard
const NPC_KHAZARD_GUARD_DRUNK = 316; // Bribable
const NPC_KHAZARD_OGRE = 317;
const NPC_KHAZARD_SCORPION = 318;
const NPC_HENGRAD = 319; // Prisoner
const NPC_FIGHT_SLAVE_JOE = 320;
const NPC_FIGHT_SLAVE_KELVIN = 321;
const NPC_LOCAL = 322; // Villagers

// Item IDs
const ITEM_COINS = 10;
const ITEM_KHAZARD_HELMET = 790;
const ITEM_KHAZARD_CHAINMAIL = 791;
const ITEM_KHAZARD_CELL_KEYS = 792;
const ITEM_KHALI_BREW = 793;

// Object IDs
const OBJ_CUPBOARD_CLOSED = 381;
const OBJ_CUPBOARD_OPEN = 382;
const OBJ_PRISON_DOOR = 371; // Generic door ID for cells

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

// ----------------------------------------
// NPC Interactions
// ----------------------------------------

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // --- Lady Servil (Start) ---
    if (npc.id === NPC_LADY_SERVIL) {
        if (stage === 0) {
            await npc.say('Hi there, looks like you\'re in some trouble');
            await npc.say('Oh, I wish this broken cart was my only problem');
            await npc.say('Sob.. I\'ve got to find my family.. sob');

            const choice = await player.ask(['I hope you can, good luck', 'Can I help you?'], true);
            if (choice === 1) {
                await npc.say('Would you? Please?');
                await npc.say('I\'m Lady Servil. My husband and son were kidnapped');
                await npc.say('By General Khazard\'s men');
                await npc.say('They are being held in the Fight Arena south of here');
                await player.say('I\'ll try my best to return your family');
                setQuestStage(player, 1);
            }
        } else if (stage === 3 || stage === -1) {
            await npc.say('You\'re alive! I thought Khazard took you');
            await npc.say('My family is safe. Thank you so much');
            if (stage === 3) {
                await npc.say('Please take this reward');
                player.inventory.add(ITEM_COINS, 1000);
                player.addQuestPoints(QUEST_POINTS);
                player.addExperience(0, 12175); // Attack XP authentic
                player.addExperience(3, 2175); // Thieving XP authentic
                setQuestStage(player, -1);
                player.message('You have completed the Fight Arena quest');
            }
        } else {
            await npc.say('Please bring back my family');
        }
    }

    // --- Khazard Guard (Entrance/Patrol) ---
    if (npc.id === NPC_KHAZARD_GUARD) {
        if (player.inventory.has(ITEM_KHAZARD_HELMET, true) && player.inventory.has(ITEM_KHAZARD_CHAINMAIL, true)) {
            await npc.say('Move along soldier');
        } else {
            await npc.say('Halt! Only Khazard\'s men allowed');
            // Could attack or block entry authentic
        }
    }

    // --- Drunk Guard (Keys) ---
    if (npc.id === NPC_KHAZARD_GUARD_DRUNK) {
        if (stage >= 1) {
            if (player.getCache('guard_asleep')) {
                if (!player.inventory.has(ITEM_KHAZARD_CELL_KEYS)) {
                    player.inventory.add(ITEM_KHAZARD_CELL_KEYS, 1);
                    player.message('You take the keys from the sleeping guard');
                } else {
                    player.message('The guard is fast asleep');
                }
                return true;
            }

            await npc.say('What do you want?');
            if (player.inventory.has(ITEM_KHALI_BREW)) {
                await player.say('Do you fancy a drink?');
                await npc.say('I shouldn\'t... but go on then');
                player.inventory.remove(ITEM_KHALI_BREW, 1);
                player.message('The guard downs the brew');
                await npc.say('Wow.. that\'s strong..');
                await npc.say('Zzzzz...');
                player.setCache('guard_asleep', true);
                player.inventory.add(ITEM_KHAZARD_CELL_KEYS, 1);
                player.message('The guard falls asleep and drops the keys');
            } else {
                await npc.say('Get lost unless you have some Khali Brew');
            }
        }
    }

    // --- Jeremy Servil (In Cell) ---
    if (npc.id === NPC_JEREMY_SERVIL) {
        if (stage === 1 || stage === 2) {
            if (player.getCache('freed_jeremy')) {
                await npc.say('Go help my father!');
                return true;
            }

            await player.say('I\'m here to help');
            if (player.inventory.has(ITEM_KHAZARD_CELL_KEYS)) {
                await player.say('I have the keys');
                player.message('You unlock the cell door');
                await npc.say('Thank you! My father is in the arena!');
                await npc.say('Please save him!');
                player.setCache('freed_jeremy', true);
                // Authentic: Logic triggers Ogre fight immediately or upon entering arena
                setQuestStage(player, 2);
                // Force spawn Ogre?
                // In authentic, talking to Jeremy here triggers the Justin/Ogre scene
                player.message('You hear a roar from the arena');
            } else {
                await npc.say('The guard has the keys');
            }
        }
    }

    // --- Hengrad (Prisoner) ---
    if (npc.id === NPC_HENGRAD) {
        if (stage === 2 && player.getCache('killed_ogre')) {
            await npc.say('So Khazard got you too?');
            await npc.say('Get ready, they\'re coming for us');
            player.message('A guard enters and drags you to the arena');
            player.teleport(609, 705); // Arena center
            // Spawn Scorpion
            const scorpion = player.world.spawnNpc(NPC_KHAZARD_SCORPION, 609, 707);
            scorpion.setTarget(player);
        }
    }

    return true;
}

// ----------------------------------------
// Object Interactions
// ----------------------------------------

async function onOpLoc(player, object) {
    // --- Cupboard (Armor) ---
    if ([OBJ_CUPBOARD_CLOSED, OBJ_CUPBOARD_OPEN].includes(object.id)) {
        player.message('You search the cupboard...');
        if (!player.inventory.has(ITEM_KHAZARD_HELMET) && !player.inventory.has(ITEM_KHAZARD_CHAINMAIL)) {
            player.message('You find a Khazard Helmet and Chainmail');
            player.inventory.add(ITEM_KHAZARD_HELMET, 1);
            player.inventory.add(ITEM_KHAZARD_CHAINMAIL, 1);
        } else {
            player.message('It is empty');
        }
        return true;
    }

    // --- Prison Door ---
    if (object.id === OBJ_PRISON_DOOR) {
        // Generic check if locked, requires keys usually
        if (player.inventory.has(ITEM_KHAZARD_CELL_KEYS)) {
            player.message('You unlock the door');
            // Allow pass or replace object temporarily
        } else {
            player.message('The door is locked');
        }
        return true;
    }

    return false;
}

// ----------------------------------------
// Combat Events (Kill Triggers)
// ----------------------------------------

function onNpcKilled(player, npc) {
    const stage = getQuestStage(player);

    if (npc.id === NPC_KHAZARD_OGRE) {
        player.setCache('killed_ogre', true);
        player.message('You kill the Ogre!');
        player.message('General Khazard appears and captures you!');
        player.teleport(609, 715); // Prison Cell
    }

    if (npc.id === NPC_KHAZARD_SCORPION) {
        player.message('You defeat the Scorpion!');
        player.message('General Khazard yells: Bring out Bouncer!');
        const bouncer = player.world.spawnNpc(NPC_BOUNCER, 609, 707);
        bouncer.setTarget(player);
    }

    if (npc.id === NPC_BOUNCER) {
        player.message('You defeat Bouncer!');
        player.message('General Khazard is furious!');
        player.message('He attacks you!');
        const general = player.world.spawnNpc(NPC_GENERAL_KHAZARD, 609, 707);
        general.setTarget(player);
    }

    if (npc.id === NPC_GENERAL_KHAZARD) {
        player.message('You defeat General Khazard!');
        player.message('He retreats, vowing revenge.');
        setQuestStage(player, 3);
    }
}

module.exports = {
    name: 'fight-arena',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    onNpcKilled,
    npcs: [NPC_LADY_SERVIL, NPC_JEREMY_SERVIL, NPC_KHAZARD_GUARD, NPC_KHAZARD_GUARD_DRUNK, NPC_HENGRAD],
    objects: [OBJ_CUPBOARD_CLOSED, OBJ_CUPBOARD_OPEN, OBJ_PRISON_DOOR]
};
