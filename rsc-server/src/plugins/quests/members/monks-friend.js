const QUEST_NAME = "Monk's Friend";
const QUEST_POINTS = 1;

// NPCs
const NPC_BROTHER_OMAD = 214;
const NPC_BROTHER_CEDRIC = 215;

// Items
const ITEM_BLANKET = 583;
const ITEM_BUCKET_OF_WATER = 50;
const ITEM_LOGS = 14;
const ITEM_LAW_RUNE = 42;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // Brother Omad in monastery
    if (npc.id === NPC_BROTHER_OMAD) {
        if (stage === 0) {
            await npc.say('...yawn...oh, hello...yawn...');
            await npc.say('I\'m sorry, I\'m just so tired. Haven\'t slept in a week.');
            const choice = await player.ask(['Why can\'t you sleep?', 'Sorry, too busy'], true);
            if (choice === 0) {
                await npc.say('It\'s Brother Androe\'s son. Constant crying!');
                await npc.say('Thieves stole his favourite blanket.');
                await npc.say('He won\'t rest until it\'s returned.');
                const help = await player.ask(['Can I help?', 'I hope you find it'], true);
                if (help === 0) {
                    await npc.say('Please! The thieves hide in a cave in the forest.');
                    await npc.say('It\'s hidden under a ring of stones.');
                    setQuestStage(player, 1);
                }
            }
        } else if (stage === 1) {
            await npc.say('Please tell me you have the blanket?');
            if (player.inventory.has(ITEM_BLANKET)) {
                player.inventory.remove(ITEM_BLANKET, 1);
                await player.say('Yes! I recovered it from the thieves!');
                await npc.say('Excellent! That should cheer up the child.');
                await npc.say('Now I can get some rest. Farewell!');
                player.message('Well done! You have completed part 1 of Monk\'s Friend.');
                setQuestStage(player, 2);
            } else {
                await player.say('I\'m afraid not.');
            }
        } else if (stage === 2) {
            await npc.say('Much better now I\'m sleeping well!');
            await npc.say('Now I can organise the party for Androe\'s son.');
            await npc.say('We just need Brother Cedric to return with the wine.');
            const choice = await player.ask(['Who is Brother Cedric?', 'Enjoy it!'], true);
            if (choice === 0) {
                await npc.say('Cedric went to get wine 3 days ago.');
                await npc.say('He probably got drunk and lost in the forest.');
                await npc.say('Could you look for him?');
                setQuestStage(player, 3);
            }
        } else if (stage >= 3 && stage < 6) {
            await npc.say('Oh my, I need a drink. Where is Brother Cedric?');
        } else if (stage === 6) {
            await player.say('Brother Cedric is on his way!');
            await npc.say('Good, good, good! Now we can party!');
            await npc.say('I have little to repay you with, but take these runestones.');
            player.inventory.add(ITEM_LAW_RUNE, 8);
            player.addQuestPoints(QUEST_POINTS);
            setQuestStage(player, -1);
            player.message('You have completed Monk\'s Friend!');
        } else if (stage === -1) {
            await npc.say('Dum dee do la la... hiccup... that\'s good wine!');
        }
        return true;
    }

    // Brother Cedric in forest
    if (npc.id === NPC_BROTHER_CEDRIC) {
        if (stage < 3) {
            await npc.say('honey...money...woman...wine...hic...');
            player.message('The monk has had too much to drink.');
        } else if (stage === 3) {
            await player.say('Brother Cedric, are you okay?');
            await npc.say('yeesshhh, I\'m very, very... drunk... hic...');
            await player.say('Brother Omad needs the wine for the party!');
            await npc.say('Oh dear! Please find me some water.');
            await npc.say('Once I\'m sober I\'ll help you take the wine back.');
            setQuestStage(player, 4);
        } else if (stage === 4) {
            await npc.say('...hic... oh my head... I need some water.');
        } else if (stage === 5) {
            await npc.say('Want to help me fix the cart?');
            const help = await player.ask(['Yes, I\'d be happy to', 'No, not really'], true);
            if (help === 0) {
                await npc.say('I need some wood.');
                if (player.inventory.has(ITEM_LOGS)) {
                    player.inventory.remove(ITEM_LOGS, 1);
                    await player.say('Here you go, I\'ve got some wood.');
                    await npc.say('Well done! I\'ll fix this cart.');
                    await npc.say('Head back to Brother Omad. Tell him I\'m on my way!');
                    setQuestStage(player, 6);
                }
            }
        } else if (stage === 6) {
            await npc.say('I\'m almost done here. Go tell Omad I won\'t be long!');
        } else if (stage === -1) {
            await npc.say('Brother Omad sends his thanks!');
        }
        return true;
    }

    return false;
}

async function onUseItemOnNPC(player, item, npc) {
    // Give water to drunk Cedric
    if (npc.id === NPC_BROTHER_CEDRIC && getQuestStage(player) === 4 && item.id === ITEM_BUCKET_OF_WATER) {
        player.inventory.remove(ITEM_BUCKET_OF_WATER, 1);
        await player.say('Cedric, here, drink some water.');
        await npc.say('Oh yes, my head\'s starting to spin. Gulp... gulp...');
        player.message('Brother Cedric drinks the water.');
        await npc.say('Aah, that\'s better. Now I just need to fix this cart.');
        await npc.say('Could you help?');
        setQuestStage(player, 5);
        return true;
    }
    return false;
}

module.exports = {
    name: 'monks-friend',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onUseItemOnNPC,
    npcs: [NPC_BROTHER_OMAD, NPC_BROTHER_CEDRIC]
};
