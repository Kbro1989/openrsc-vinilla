const QUEST_NAME = "Druidic Ritual";
const QUEST_POINTS = 4;

// NPCs
const NPC_KAQEMEEX = 210;
const NPC_SANFEW = 211;
const NPC_SUIT_OF_ARMOUR = 212;

// Items - Raw meats
const ITEM_RAW_CHICKEN = 133;
const ITEM_RAW_BEEF = 132;
const ITEM_RAW_RAT_MEAT = 503;
const ITEM_RAW_BEAR_MEAT = 504;

// Items - Enchanted meats
const ITEM_ENCHANTED_CHICKEN = 505;
const ITEM_ENCHANTED_BEEF = 506;
const ITEM_ENCHANTED_RAT = 507;
const ITEM_ENCHANTED_BEAR = 508;

// Objects
const OBJ_CAULDRON = 236;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

// Helper dialogue function
async function stoneCircleDialogue(player, npc) {
    await npc.say('That used to be our stone circle');
    await npc.say('Unfortunately many years ago dark wizards cast a wicked spell on it');
    await npc.say('Corrupting it for their own evil purposes');
    await npc.say('And making it useless for us');
    await npc.say('We need someone who will go on a quest for us');
    await npc.say('To help us purify the circle of Varrock');

    const choice = await player.ask([
        'Ok, I will try and help',
        'No that doesn\'t sound very interesting',
        'So is there anything in this for me?'
    ], false);

    if (choice === 0) {
        await player.say('Ok I will try and help');
        await npc.say('Ok go and speak to our Elder druid, Sanfew');
        await npc.say('He lives in our village to the south of here');
        await npc.say('He knows better what we need than I');
        setQuestStage(player, 1);
    } else if (choice === 1) {
        await player.say('No that doesn\'t sound very interesting');
        await npc.say('Well suit yourself, we\'ll have to find someone else');
    } else if (choice === 2) {
        await player.say('So is there anything in this for me?');
        await npc.say('We are skilled in the art of herblaw');
        await npc.say('We can teach you some of our skill if you complete your quest');

        const subChoice = await player.ask([
            'Ok, I will try and help',
            'No that doesn\'t sound very interesting'
        ], false);

        if (subChoice === 0) {
            await player.say('Ok I will try and help');
            await npc.say('Ok go and speak to our Elder druid, Sanfew');
            setQuestStage(player, 1);
        } else {
            await player.say('No that doesn\'t sound very interesting');
            await npc.say('Well suit yourself, we\'ll have to find someone else');
        }
    }
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // Kaqemeex at stone circle - starts quest, finishes quest
    if (npc.id === NPC_KAQEMEEX) {
        if (stage === 0) {
            await npc.say('What brings you to our holy Monument?');
            const choice = await player.ask([
                'Who are you?',
                'I\'m in search of a quest',
                'Did you build this?'
            ], true);

            if (choice === 0) {
                // Who are you?
                await npc.say('We are the druids of Guthix');
                await npc.say('We worship our God at our famous stone circles');

                const subChoice = await player.ask([
                    'What about the stone circle full of dark wizards?',
                    'So what\'s so good about Guthix?',
                    'Well I\'ll be on my way now'
                ], false);

                if (subChoice === 0) {
                    await stoneCircleDialogue(player, npc);
                } else if (subChoice === 1) {
                    await player.say('So what\'s so good about Guthix?');
                    await npc.say('Guthix is very important to this world');
                    await npc.say('He is the God of nature and balance');
                    await npc.say('He is in the trees and he is in the rock');
                }
            } else if (choice === 1) {
                // Quest dialogue
                await npc.say('I think I may have a worthwhile quest for you actually');
                await npc.say('I don\'t know if you are familiar with the stone circle south of Varrock');
                await stoneCircleDialogue(player, npc);
            } else if (choice === 2) {
                // Did you build this?
                await npc.say('Well I didn\'t build it personally');
                await npc.say('Our forebearers did');
                await npc.say('The first druids of Guthix built many stone circles 800 years ago');
                await npc.say('Only 2 that we know of remain');
                await npc.say('And this is the only 1 we can use any more');

                const subChoice2 = await player.ask([
                    'What about the stone circle full of dark wizards?',
                    'I\'m in search of a quest',
                    'Well I\'ll be on my way now'
                ], true);

                if (subChoice2 === 0) {
                    await stoneCircleDialogue(player, npc);
                } else if (subChoice2 === 1) {
                    await npc.say('I think I may have a worthwhile quest for you actually');
                    await npc.say('I don\'t know if you are familiar with the stone circle south of Varrock');
                    await stoneCircleDialogue(player, npc);
                } else {
                    await npc.say('Goodbye');
                }
            }
        } else if (stage === 1 || stage === 2) {
            await player.say('Hello again');
            await npc.say('You need to speak to Sanfew in the village south of here');
            await npc.say('To continue with your quest');
        } else if (stage === 3) {
            await npc.say('I\'ve heard you were very helpful to Sanfew');
            await npc.say('I will teach you the herblaw you need to know now');
            player.message('You have completed the Druidic Ritual quest!');
            player.addExperience('herblaw', 250);
            player.addQuestPoints(QUEST_POINTS);
            setQuestStage(player, -1);
            player.message('You can now use the Herblaw skill!');
        } else if (stage === -1) {
            await npc.say('Hello, how is the herblaw going?');
            const endChoice = await player.ask([
                'Very well thankyou',
                'I need more practice at it'
            ], true);
            // Just acknowledge, no 99 cape (not RSC authentic)
        }
        return true;
    }

    // Sanfew in Taverley - gives meat task
    if (npc.id === NPC_SANFEW) {
        if (stage === 0) {
            await npc.say('What can I do for you young \'un?');
            const choice = await player.ask([
                'I\'ve heard you druids might be able to teach me herblaw',
                'Actually I don\'t need to speak to you'
            ], true);

            if (choice === 0) {
                await npc.say('You should go to speak to Kaqemeex');
                await npc.say('He is probably our best teacher of herblaw at the moment');
                await npc.say('I believe he is at our stone circle to the north of here');
            } else {
                player.message('Sanfew grunts');
                await player.delay(3);
            }
        } else if (stage === 1) {
            await npc.say('What can I do for you young \'un?');
            const choice = await player.ask([
                'I\'ve been sent to help purify the Varrock stone circle',
                'Actually I don\'t need to speak to you'
            ], true);

            if (choice === 0) {
                await npc.say('Well what I\'m struggling with');
                await npc.say('Is the meats I needed for the sacrifice to Guthix');
                await npc.say('I need the raw meat from 4 different animals');
                await npc.say('Which all need to be dipped in the cauldron of thunder');

                const subChoice = await player.ask([
                    'Where can I find this cauldron?',
                    'Ok I\'ll do that then'
                ], false);

                if (subChoice === 0) {
                    await player.say('Where can I find this cauldron');
                    await npc.say('It is in the mysterious underground halls');
                    await npc.say('Which are somewhere in the woods to the south of here');
                }
                setQuestStage(player, 2);
            } else {
                player.message('Sanfew grunts');
                await player.delay(3);
            }
        } else if (stage === 2) {
            await npc.say('Have you got what I need yet?');

            if (player.inventory.has(ITEM_ENCHANTED_CHICKEN) &&
                player.inventory.has(ITEM_ENCHANTED_BEEF) &&
                player.inventory.has(ITEM_ENCHANTED_RAT) &&
                player.inventory.has(ITEM_ENCHANTED_BEAR)) {
                await player.say('Yes I have everything');
                player.message('You give the meats to Sanfew');
                await player.delay(3);
                player.inventory.remove(ITEM_ENCHANTED_CHICKEN, 1);
                player.inventory.remove(ITEM_ENCHANTED_BEEF, 1);
                player.inventory.remove(ITEM_ENCHANTED_RAT, 1);
                player.inventory.remove(ITEM_ENCHANTED_BEAR, 1);
                await npc.say('Thank you, that has brought us much closer to reclaiming our stone circle');
                await npc.say('Now go and talk to Kaqemeex');
                await npc.say('He will show you what you need to know about herblaw');
                setQuestStage(player, 3);
            } else {
                await player.say('No not yet');
                const reminderChoice = await player.ask([
                    'What was I meant to be doing again?',
                    'I\'ll get on with it'
                ], true);

                if (reminderChoice === 0) {
                    await npc.say('I need the raw meat from 4 different animals');
                    await npc.say('Which all need to be dipped in the cauldron of thunder');

                    const subChoice2 = await player.ask([
                        'Where can I find this cauldron?',
                        'Ok I\'ll do that then'
                    ], false);

                    if (subChoice2 === 0) {
                        await player.say('Where can I find this cauldron');
                        await npc.say('It is in the mysterious underground halls');
                        await npc.say('Which are somewhere in the woods to the south of here');
                    }
                }
            }
        } else if (stage >= 3) {
            await npc.say('What can I do for you young \'un?');
            const choice = await player.ask([
                'Have you any more work for me, to help reclaim the circle?',
                'Actually I don\'t need to speak to you'
            ], true);

            if (choice === 0) {
                await npc.say('Not at the moment');
                await npc.say('I need to make some more preparations myself now');
            } else {
                player.message('Sanfew grunts');
                await player.delay(3);
            }
        }
        return true;
    }

    return false;
}

async function onUseItemOnObject(player, item, object) {
    // Cauldron of Thunder - enchant meats
    if (object.id === OBJ_CAULDRON) {
        const stage = getQuestStage(player);
        if (stage < 1) {
            player.message('Nothing interesting happens.');
            return true;
        }

        const enchantMap = {
            [ITEM_RAW_CHICKEN]: { enchanted: ITEM_ENCHANTED_CHICKEN, name: 'chicken' },
            [ITEM_RAW_BEEF]: { enchanted: ITEM_ENCHANTED_BEEF, name: 'beef' },
            [ITEM_RAW_RAT_MEAT]: { enchanted: ITEM_ENCHANTED_RAT, name: 'rat meat' },
            [ITEM_RAW_BEAR_MEAT]: { enchanted: ITEM_ENCHANTED_BEAR, name: 'bear meat' }
        };

        if (enchantMap[item.id]) {
            const { enchanted, name } = enchantMap[item.id];
            player.message(`You dip the ${name} in the cauldron.`);
            player.inventory.remove(item.id, 1);
            player.inventory.add(enchanted, 1);
            return true;
        }
    }
    return false;
}

module.exports = {
    name: 'druidic-ritual',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onUseItemOnObject,
    npcs: [NPC_KAQEMEEX, NPC_SANFEW],
    objects: [OBJ_CAULDRON]
};
