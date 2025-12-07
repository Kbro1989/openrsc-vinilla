const QUEST_NAME = 'Dwarf Cannon';
const QUEST_POINTS = 1;

// NPC IDs
const NPC_CAPTAIN_LAWGOF = 208;
const NPC_DWARF_COMMANDER = 208; // Alias
const NPC_GILOB_GUARD = 209; // Not used directly in dialogue, implied? Checked logic: Gilob is missing, find remains.
const NPC_LOLLK = 210;
const NPC_NULODION = 207;

// Item IDs
const ITEM_RAILING = 210; // Check ID. Authentic code uses ItemId.RAILING_DWARF_CANNON.
const ITEM_DWARF_REMAINS = 211;
const ITEM_TOOL_KIT = 1097; // Authentic: TOOL_KIT
const ITEM_NULODIONS_NOTES = 1099;
const ITEM_AMMO_MOULD = 1098;
const ITEM_CANNON_BALL = 1041;

// Cannon Parts (for shop/fixing)
const ITEM_BASE = 1032;
const ITEM_STAND = 1033;
const ITEM_BARRELS = 1034;
const ITEM_FURNACE = 1035;

// Object IDs
const OBJ_RAILING_1 = 181;
const OBJ_RAILING_2 = 182;
const OBJ_RAILING_3 = 183;
const OBJ_RAILING_4 = 184;
const OBJ_RAILING_5 = 185;
const OBJ_RAILING_6 = 186;
const OBJ_BROKEN_RAILING_SEARCH = 193; // "You search the railing but find nothing"

const OBJ_CRATE_LOLLK = 987;
const OBJ_CANNON_BROKEN = 994;

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

    // --- Captain Lawgof (Quest Giver) ---
    if (npc.id === NPC_CAPTAIN_LAWGOF) {
        if (stage === 0) {
            await npc.say('Hello traveller, I\'m pleased to see you');
            await npc.say('We were hoping to find an extra pair of hands');
            await npc.say('That\'s if you don\'t mind helping?');
            await player.say('Why, what\'s wrong?');
            await npc.say('As part of the Dwarven Black Guard...');
            await npc.say('...it is our duty to protect these mines');
            await npc.say('But we just don\'t have the manpower');
            await npc.say('Could you help?');

            const choice = await player.ask([
                'I\'m sorry, I\'m too busy mining',
                'Yeah, I\'d love to help'
            ], true);

            if (choice === 1) {
                await npc.say('Thank you, we have no time to waste');
                await npc.say('The goblins have been attacking from the forests to the south');
                await npc.say('They manage to get through the broken railings');
                await npc.say('Could you please replace them with these new ones');
                await player.say('Sounds easy enough');

                player.message('The Dwarf Commander gives you six railings');
                player.inventory.add(ITEM_RAILING, 6);
                await npc.say('Let me know once you\'ve fixed the railings');
                await player.say('Ok Commander');
                setQuestStage(player, 1);
            } else {
                await npc.say('Ok then, we\'ll have to find someone else');
            }
        }
        else if (stage === 1) {
            // Check if all railings fixed
            if (player.getCache('rail_1') && player.getCache('rail_2') &&
                player.getCache('rail_3') && player.getCache('rail_4') &&
                player.getCache('rail_5') && player.getCache('rail_6')) {

                await npc.say('The goblins seem to have stopped getting in');
                await npc.say('I think you\'ve done the job');
                await player.say('Good stuff');
                await npc.say('Could you do me one more favour?');
                await npc.say('I need you to go check up on a guard');
                await npc.say('He should be in the Black Guard watchtower just to the south');
                await npc.say('He should have reported in by now');
                await player.say('Ok, I\'ll see what I can find');
                setQuestStage(player, 2);

                // Clear cache
                ['1', '2', '3', '4', '5', '6'].forEach(i => player.removeCache('rail_' + i));
            } else {
                await npc.say('The goblins are still getting in');
                await npc.say('So there must still be some broken railings');

                if (!player.inventory.has(ITEM_RAILING)) {
                    await player.say('But I\'m out of railings');
                    player.inventory.add(ITEM_RAILING, 1);
                    await npc.say('Ok, we\'ve got plenty');
                }
            }
        }
        else if (stage === 2) {
            if (player.getCache('found_remains')) {
                await npc.say('Have you been to the watchtower yet?');
                await player.say('Yes, I went up but there was no one');
                await npc.say('That\'s strange, Gilob never leaves his post');

                if (player.inventory.has(ITEM_DWARF_REMAINS)) {
                    player.message('You show the Commander the remains');
                    await npc.say('What\'s this? Oh no, it can\'t be!');
                    await player.say('I\'m sorry, it looks like the goblins got him');
                    await npc.say('Noooo... those animals');
                    await npc.say('But where\'s Gilob\'s son? He was also there');
                    await player.say('The goblins must have taken him');
                    await npc.say('Please traveller, seek out the goblin\'s base');
                    await npc.say('And return the lad to us');
                    player.inventory.remove(ITEM_DWARF_REMAINS, 1);
                    setQuestStage(player, 3);
                    player.removeCache('found_remains');
                }
            } else {
                await npc.say('Any news from the watchman?');
                await player.say('Not yet');
            }
        }
        else if (stage === 3) {
            if (player.getCache('saved_lollk')) {
                await npc.say('Has Lollk returned yet?');
                await npc.say('He has! And I thank you from the bottom of my heart');
                await player.say('Always a pleasure to help');
                await npc.say('In that case I have one more favour to ask');
                await npc.say('The Black Guard sent us a cannon to help');
                await npc.say('Unfortunately we\'re having trouble fixing it');
                await npc.say('It\'s stored in our shed');
                await npc.say('If you could fix it, it would be a great help');

                const choice = await player.ask(['Ok, I\'ll see what I can do', 'Sorry, I\'ve done enough'], true);
                if (choice === 0) {
                    player.message('The Commander gives you a tool kit');
                    player.inventory.add(ITEM_TOOL_KIT, 1);
                    setQuestStage(player, 4);
                    player.removeCache('saved_lollk');
                }
            } else {
                await npc.say('Have you found the goblin\'s base?');
                await player.say('Not yet');
            }
        }
        else if (stage === 4) {
            if (player.getCache('cannon_fixed')) {
                await player.say('I think I\'ve done it, take a look');
                player.message('The Commander inspects the cannon');
                await npc.say('Well I don\'t believe it, it works!');
                await npc.say('Now if only I knew what it uses as ammo...');
                await npc.say('Could you go to the Black Guard base?');
                await npc.say('Speak to the Cannon Engineer, Nulodion');
                await npc.say('It\'s south of Ice Mountain');
                setQuestStage(player, 5);
                player.removeCache('cannon_fixed');
                player.removeCache('fix_pipe');
                player.removeCache('fix_shaft');
                player.removeCache('fix_motor'); // etc
            } else {
                if (!player.inventory.has(ITEM_TOOL_KIT)) {
                    player.inventory.add(ITEM_TOOL_KIT, 1);
                    await npc.say('Here\'s another tool kit');
                }
                await npc.say('How are you doing with that cannon?');
            }
        }
        else if (stage === 5) {
            await npc.say('Any word from Nulodion?');
            await player.say('Not yet');
        }
        else if (stage === 6) {
            if (player.inventory.has(ITEM_NULODIONS_NOTES) && player.inventory.has(ITEM_AMMO_MOULD)) {
                await player.say('I have spoken to him, he gave me these');
                player.inventory.remove(ITEM_NULODIONS_NOTES, 1);
                player.inventory.remove(ITEM_AMMO_MOULD, 1);
                await npc.say('Aah, of course, we make the ammo!');
                await npc.say('This is great, thank you');
                await player.say('You could give me a cannon?');
                await npc.say('Hah, you\'d be lucky, they cost a fortune');
                await npc.say('But I\'m sure Nulodion will sell you one');

                player.addQuestPoints(QUEST_POINTS);
                setQuestStage(player, -1);
                player.message('You have completed the Dwarf Cannon quest');
            }
        }
    }

    // --- Nulodion (Engineer) ---
    if (npc.id === NPC_NULODION) {
        if (stage === 5) {
            await npc.say('Can I help you?');
            await player.say('The Dwarf Commander sent me');
            await player.say('He\'s having trouble with his cannon');
            await npc.say('Of course, we forgot to send the ammo mould!');
            await npc.say('Here, take these to him');
            player.inventory.add(ITEM_NULODIONS_NOTES, 1);
            player.inventory.add(ITEM_AMMO_MOULD, 1);
            setQuestStage(player, 6);
        }
        else if (stage === -1) {
            // Shop logic
            await npc.say('Hello again');
            const choice = await player.ask([
                'I was hoping you might sell me a cannon?',
                'I want to know more about the cannon'
            ], true);

            if (choice === 0) {
                await npc.say('I shouldn\'t really... but since you helped us');
                await npc.say('I can sell you the full setup for 750,000 coins');
                const buy = await player.ask(['Ok, I\'ll take it', 'That\'s too much'], true);
                if (buy === 0) {
                    if (player.inventory.remove(ITEM_COINS, 750000)) {
                        player.inventory.add(ITEM_BASE, 1);
                        player.inventory.add(ITEM_STAND, 1);
                        player.inventory.add(ITEM_BARRELS, 1);
                        player.inventory.add(ITEM_FURNACE, 1);
                        player.inventory.add(ITEM_AMMO_MOULD, 1);
                        await npc.say('There you go, be careful with it');
                    } else {
                        await player.say('I don\'t have enough money');
                    }
                }
            }
        }
    }

    return true;
}

// ----------------------------------------
// Object Interactions
// ----------------------------------------

async function onGameObjectCommandOne(player, object) {
    const stage = getQuestStage(player);

    // --- Railing Repairs ---
    if ([OBJ_RAILING_1, OBJ_RAILING_2, OBJ_RAILING_3, OBJ_RAILING_4, OBJ_RAILING_5, OBJ_RAILING_6].includes(object.id)) {
        if (stage === 1) {
            // Check if already fixed
            const railNum = object.id - 180; // 1 to 6
            if (player.getCache('rail_' + railNum)) {
                player.message('You have already fixed this railing');
                return true;
            }

            player.message('one railing is broken and needs to be replaced');
            if (player.inventory.has(ITEM_RAILING)) {
                player.message('You attempt to replace the railing...');
                await player.world.sleepTicks(2);
                // 75% fail chance authentic
                if (Math.random() > 0.25) {
                    player.message('You fail and cut yourself');
                    player.damage(2);
                } else {
                    player.message('You replace the railing');
                    player.inventory.remove(ITEM_RAILING, 1);
                    player.setCache('rail_' + railNum, true);
                }
            } else {
                player.message('You need a railing to fix this');
            }
        } else {
            player.message('You inspect the railing, it seems damaged');
        }
        return true;
    }

    // --- Saved Lollk ---
    if (object.id === OBJ_CRATE_LOLLK) {
        if (stage === 3 && !player.getCache('saved_lollk')) {
            player.message('You search the crate...');
            await player.world.sleepTicks(2);
            player.message('Inside you see a dwarf child tied up');
            player.message('You untie the child');
            // Spawn Lollk momentarily?
            player.message('The dwarf child thanks you and runs home');
            player.setCache('saved_lollk', true);
        } else {
            player.message('The crate is empty');
        }
        return true;
    }

    // --- Broken Cannon ---
    if (object.id === OBJ_CANNON_BROKEN) {
        if (stage === 4) {
            if (player.getCache('cannon_fixed')) {
                player.message('The cannon seems to be in working order');
                return true;
            }
            if (!player.inventory.has(ITEM_TOOL_KIT)) {
                player.message('You need a tool kit to fix this');
                return true;
            }

            // Simplification: Fix all in one go or menu? Authentic has menu.
            // Let's do simple probabilistic fix loop for now or menu if supported.
            // Using ASK for menu replication
            const parts = [];
            if (!player.getCache('fix_pipe')) parts.push('Pipe');
            if (!player.getCache('fix_shaft')) parts.push('Shaft');

            if (parts.length === 0) {
                player.setCache('cannon_fixed', true);
                player.message('The cannon is fully fixed!');
                return true;
            }

            player.message('You inspect the cannon. It has damaged parts.');
            // Creating a dynamic repair would be better, but for this file limit:
            // Assume player fixes one by one on click
            const part = parts[0];
            player.message('You attempt to fix the ' + part);
            await player.world.sleepTicks(2);
            if (Math.random() > 0.5) { // Authentic failure rate
                player.message('You manage to fix the ' + part);
                player.setCache('fix_' + part.toLowerCase(), true);
            } else {
                player.message('You fail to fix it');
            }
        } else {
            player.message('It\'s a strange dwarf contraption');
        }
        return true;
    }

    return false;
}

// --- Pickup Remains ---
async function onGroundItemTake(player, item) {
    if (item.id === ITEM_DWARF_REMAINS) {
        if (getQuestStage(player) === 2) {
            player.setCache('found_remains', true);
        }
    }
    return false; // Allow pickup
}

module.exports = {
    name: 'dwarf-cannon',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onGameObjectCommandOne,
    onGroundItemTake,
    npcs: [NPC_CAPTAIN_LAWGOF, NPC_NULODION, NPC_DWARF_COMMANDER],
    objects: [OBJ_RAILING_1, OBJ_RAILING_2, OBJ_RAILING_3, OBJ_RAILING_4, OBJ_RAILING_5, OBJ_RAILING_6, OBJ_CRATE_LOLLK, OBJ_CANNON_BROKEN]
};
