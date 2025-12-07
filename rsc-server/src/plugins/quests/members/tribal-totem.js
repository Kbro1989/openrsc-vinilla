const QUEST_NAME = 'Tribal Totem';
const QUEST_POINTS = 1;

// NPCs
const NPC_KANGAI_MAU = 369;
const NPC_HORACIO = 370;
const NPC_CROMPERTY = 371;
const NPC_RPDT_EMPLOYEE = 372;

// Items
const ITEM_TRIBAL_TOTEM = 815;
const ITEM_ADDRESS_LABEL = 816;
const ITEM_SWORDFISH = 369;

// Objects
const OBJ_CRATE_LABEL = 329;      // Crate with label
const OBJ_CRATE_EMPTY = 328;      // Empty crate
const OBJ_STAIRS_TRAP = 331;      // Trapped stairs
const OBJ_CHEST_CLOSED = 333;
const OBJ_CHEST_OPEN = 332;
const OBJ_DOOR_LOCK = 98;         // Combination lock door

// Lock combination: BRAD (B=2nd letter, R=1st position, A=1st position, D=4th position)
// Dial 1: B (position B), Dial 2: R (position R), Dial 3: A (position A), Dial 4: D (position D)

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // Kangai Mau - quest giver in Brimhaven
    if (npc.id === NPC_KANGAI_MAU) {
        if (stage === 0) {
            await npc.say('Hello, I Kangai Mau of Rantuki tribe.');
            const choice = await player.ask(['I\'m in search of adventure', 'What are you doing here?'], true);
            if (choice === 0 || choice === 1) {
                await npc.say('I need someone to go to Ardougne.');
                await npc.say('Find house of Lord Handelmort.');
                await npc.say('He has our tribal totem. We need it back!');
                const accept = await player.ask(['Ok, I will get it back', 'Why does he have it?'], true);
                if (accept === 0) {
                    setQuestStage(player, 1);
                } else {
                    await npc.say('He is an explorer who thinks he can steal our stuff!');
                    const accept2 = await player.ask(['Ok, I will get it back', 'That\'s unfortunate'], true);
                    if (accept2 === 0) setQuestStage(player, 1);
                }
            }
        } else if (stage >= 1) {
            await npc.say('Have you got our totem back?');
            if (player.inventory.has(ITEM_TRIBAL_TOTEM)) {
                await player.say('Yes I have!');
                player.inventory.remove(ITEM_TRIBAL_TOTEM, 1);
                await npc.say('Thank you brave adventurer!');
                await npc.say('Here, have some freshly cooked Karamja fish!');
                player.inventory.add(ITEM_SWORDFISH, 5);
                player.addExperience('thieving', 1775);
                player.addQuestPoints(QUEST_POINTS);
                setQuestStage(player, -1);
                player.message('You have completed Tribal Totem!');
            } else {
                await player.say('No, it\'s not that easy.');
                await npc.say('Bah, you no good!');
            }
        }
        return true;
    }

    // Horacio the gardener - hints about lock combo
    if (npc.id === NPC_HORACIO) {
        await npc.say('It\'s a fine day to be in the garden!');
        if (stage >= 1) {
            const choice = await player.ask(['Do you garden round back too?', 'Who are you?'], true);
            if (choice === 0) {
                await npc.say('That I do.');
                await player.say('Doesn\'t all this security get in your way?');
                await npc.say('I know by heart the combination to the door lock.');
                await npc.say('It\'s rather easy - it\'s his middle name.');
                await player.say('Who\'s middle name?');
                await npc.say('Hmm I shouldn\'t have said that. Forget it!');
                // Hint: Lord Handelmort's middle name is DORIAN (or similar)
            }
        }
        return true;
    }

    // Wizard Cromperty - teleporter
    if (npc.id === NPC_CROMPERTY) {
        await npc.say('I am Cromperty, a wizard and inventor!');
        await npc.say('My latest invention is my patent pending teleport block.');
        const choice = await player.ask(['Can I be teleported?', 'Where is the other block?'], true);
        if (choice === 0) {
            await npc.say('By all means! Though I don\'t know where you\'ll end up.');
            const teleport = await player.ask(['Yes, teleport me!', 'That sounds dangerous'], true);
            if (teleport === 0) {
                player.message('Cromperty presses a switch on a small box.');
                if (stage === 2 || stage === -1) {
                    player.teleport(560, 588); // Inside mansion
                } else {
                    player.teleport(558, 617); // RPDT depot
                }
            }
        } else {
            await npc.say('Somewhere between here and Wizard\'s Tower.');
            await npc.say('I\'m using RPDT to deliver it.');
        }
        return true;
    }

    // RPDT Employee - delivers crate
    if (npc.id === NPC_RPDT_EMPLOYEE) {
        await npc.say('Welcome to RPDT!');
        if (player.getCache('label') && stage === 1) {
            const choice = await player.ask(['When will you deliver this crate?', 'Thanks'], true);
            if (choice === 0) {
                await npc.say('I suppose I could do it now.');
                player.message('The employee picks up the crate.');
                player.message('And takes it out to be delivered.');
                player.removeCache('label');
                setQuestStage(player, 2);
            }
        }
        return true;
    }

    return false;
}

async function onOpLoc(player, object) {
    const stage = getQuestStage(player);

    // Crate with address label
    if (object.id === OBJ_CRATE_LABEL) {
        player.message('There is a label on this crate.');
        player.message('It says: To Lord Handelmort, Ardougne');
        if (!player.inventory.has(ITEM_ADDRESS_LABEL) && !player.getCache('label')) {
            player.message('You take the label.');
            player.inventory.add(ITEM_ADDRESS_LABEL, 1);
        }
        return true;
    }

    // Trapped stairs
    if (object.id === OBJ_STAIRS_TRAP) {
        if (player.getCache('trapy')) {
            player.message('You go up the stairs carefully.');
            player.removeCache('trapy');
            player.teleport(563, 1534);
        } else {
            player.message('You hear a click beneath you...');
            player.message('You fall through a trap!');
            player.teleport(563, 3418);
            player.damage(7);
        }
        return true;
    }

    // Chest with totem
    if (object.id === OBJ_CHEST_OPEN || object.id === OBJ_CHEST_CLOSED) {
        player.message('You search the chest.');
        if (player.inventory.has(ITEM_TRIBAL_TOTEM)) {
            player.message('The chest is empty.');
        } else {
            player.message('You find a tribal totem!');
            player.inventory.add(ITEM_TRIBAL_TOTEM, 1);
        }
        return true;
    }

    return false;
}

async function onUseItemOnObject(player, item, object) {
    // Label on empty crate
    if (item.id === ITEM_ADDRESS_LABEL && object.id === OBJ_CRATE_EMPTY) {
        if (getQuestStage(player) === -1) {
            player.message('You\'ve already done this!');
        } else {
            player.message('You stick the label on the crate.');
            await player.say('Now I just need someone to deliver it.');
            player.inventory.remove(ITEM_ADDRESS_LABEL, 1);
            player.setCache('label', true);
        }
        return true;
    }
    return false;
}

async function onOpBound(player, object) {
    // Combination lock door
    if (object.id === OBJ_DOOR_LOCK) {
        player.message('Choose position for dial 1:');
        const d1 = await player.ask(['A', 'B', 'C', 'D'], true);
        player.message('Choose position for dial 2:');
        const d2 = await player.ask(['R', 'S', 'T', 'U'], true);
        player.message('Choose position for dial 3:');
        const d3 = await player.ask(['A', 'B', 'C', 'D'], true);
        player.message('Choose position for dial 4:');
        const d4 = await player.ask(['A', 'B', 'C', 'D'], true);

        // Correct: B (1), R (0), A (0), D (3)
        if (d1 === 1 && d2 === 0 && d3 === 0 && d4 === 3) {
            player.message('You hear a satisfying click!');
            player.message('The door opens.');
            // Door would open
        } else {
            player.message('The door fails to open.');
        }
        return true;
    }
    return false;
}

module.exports = {
    name: 'tribal-totem',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    onUseItemOnObject,
    onOpBound,
    npcs: [NPC_KANGAI_MAU, NPC_HORACIO, NPC_CROMPERTY, NPC_RPDT_EMPLOYEE],
    objects: [OBJ_CRATE_LABEL, OBJ_CRATE_EMPTY, OBJ_STAIRS_TRAP, OBJ_CHEST_CLOSED, OBJ_CHEST_OPEN],
    wallObjects: [OBJ_DOOR_LOCK]
};
