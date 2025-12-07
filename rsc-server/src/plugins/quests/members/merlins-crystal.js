/**
 * Merlin's Crystal Quest (Members)
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Talked to King Arthur, started quest
 * 2 - Learned about Morgan Le Faye's stronghold from Sir Lancelot
 * 3 - Defeated Sir Mordred, learned summoning ritual
 * 4 - Summoned Thrantax, can shatter crystal
 * 5 - Shattered crystal, need to talk to King Arthur
 * -1 - Complete
 * 
 * Reward: 6 Quest Points, Excalibur sword
 */

const QUEST_NAME = "Merlin's Crystal";
const QUEST_POINTS = 6;

// NPC IDs
const NPC_KING_ARTHUR = 127;
const NPC_SIR_GAWAIN = 243;
const NPC_SIR_LANCELOT = 244;
const NPC_SIR_MORDRED = 247;
const NPC_MORGAN_LE_FAYE = 248;
const NPC_THRANTAX = 249;
const NPC_LADY_LAKE = 250;
const NPC_BEGGAR = 251;

// Item IDs
const ITEM_EXCALIBUR = 166;
const ITEM_BAT_BONES = 604;
const ITEM_LIT_BLACK_CANDLE = 605;
const ITEM_BREAD = 138;
const ITEM_BUCKET = 21;
const ITEM_WAX_BUCKET = 606;
const ITEM_INSECT_REPELLENT = 507;

// Object IDs
const OBJ_MERLIN_CRYSTAL = 287;
const OBJ_CHAOS_ALTAR = 296;
const OBJ_BEEHIVE = 294;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

// Talk to NPC handlers
async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    // King Arthur
    if (npc.id === NPC_KING_ARTHUR) {
        if (stage === 0 || stage === 1) {
            await npc.say('Welcome to the court of King Arthur');
            await npc.say('I am King Arthur');

            const option = await player.ask([
                'I want to become a knight of the round table',
                'So what are you doing in Runescape?',
                'Thank you very much'
            ], true);

            if (option === 0) {
                await player.say('I want to become a knight of the round table');
                await npc.say('Well I think you need to go on a quest to prove yourself worthy');
                await npc.say('My knights like a good quest');
                await npc.say('Unfortunately our current quest is to rescue Merlin');
                await npc.say('Back in England he got himself trapped in some sort of magical Crystal');
                await npc.say("We've moved him from the cave we found him in");
                await npc.say("He's upstairs in his tower");
                await player.say('I will see what I can do then');
                await npc.say('Talk to my knights if you need any help');

                if (stage === 0) {
                    setQuestStage(player, 1);
                }
            } else if (option === 1) {
                await player.say('So what are you doing in Runescape');
                await npc.say("Well legend says we will return to Britain in it's time of greatest need");
                await npc.say("But that's not for quite a while");
                await npc.say("So we've moved the whole outfit here for now");
                await npc.say("We're passing the time in Runescape");
            }
        } else if (stage === 5) {
            await player.say('I have freed Merlin from his crystal');
            await npc.say('Ah a good job well done');
            await npc.say('I knight thee');
            await npc.say('You are now a knight of the round table');

            // Complete quest
            setQuestStage(player, -1);
            player.questPoints += QUEST_POINTS;
            player.message("Congratulations! You have completed Merlin's Crystal!");
            player.message(`You gain ${QUEST_POINTS} Quest Points`);
        } else if (stage === -1) {
            await player.say('Now I am a knight of the round table');
            await player.say('Do you have any more quests for me?');
            await npc.say("Aha, I'm glad you are here");
            await npc.say('I am sending out various knights on an important quest');
            await npc.say('I was wondering if you too would like to take up this quest?');
            // Holy Grail quest start would go here
        }
        return true;
    }

    // Sir Gawain
    if (npc.id === NPC_SIR_GAWAIN) {
        await npc.say('Good day to you sir');

        if (stage === 1) {
            const option = await player.ask([
                'Good day',
                'Any ideas on how to get Merlin out that crystal?',
                'Do you know how Merlin got trapped?'
            ], true);

            if (option === 2) {
                await player.say('Do you know how Merlin got trapped?');
                await npc.say("I would guess this is the work of the evil Morgan Le Faye");
                await player.say('And where can I find her?');
                await npc.say('She lives in her stronghold to the south of here');
                await npc.say('Guarded by some renegade knights led by Sir Mordred');
                player.cache.talked_to_gawain = true;
            }
        }
        return true;
    }

    // Sir Lancelot
    if (npc.id === NPC_SIR_LANCELOT) {
        await npc.say('Greetings I am Sir Lancelot the greatest knight in the land');
        await npc.say('What do you want?');

        if (stage === 1 && player.cache.talked_to_gawain) {
            const option = await player.ask([
                'I want to get Merlin out of the crystal',
                "You're a little full of yourself aren't you?",
                "Any ideas on how to get into Morgan Le Faye's stronghold?"
            ], true);

            if (option === 2) {
                await player.say("Any ideas on how to get into Morgan Le Faye's stronghold?");
                await npc.say('That stronghold is built in a strong defensive position');
                await npc.say("It's on a big rock sticking out into the sea");
                await npc.say('There are two ways in that I know of, the large heavy front doors');
                await npc.say('And the sea entrance, only penetrable by boat');
                await npc.say('They take all their deliveries by boat');
                setQuestStage(player, 2);
                delete player.cache.talked_to_gawain;
            }
        }
        return true;
    }

    // Morgan Le Faye (appears when Mordred is defeated)
    if (npc.id === NPC_MORGAN_LE_FAYE) {
        await npc.say('Please spare my son');

        const option = await player.ask([
            'Tell me how to untrap Merlin and I might',
            'No he deserves to die',
            'OK then'
        ], true);

        if (option === 0) {
            if (stage === 2) {
                setQuestStage(player, 3);
            }
            await npc.say("You have guessed correctly that I'm responsible for that");
            await npc.say('I suppose I can live with that fool Merlin being loose');
            await npc.say('for the sake of my son');
            await npc.say("Setting him free won't be easy though");
            await npc.say('You will need to find a pentagram as close to the crystal as you can find');
            await npc.say('You will need to drop some bat bones in the pentagram');
            await npc.say('while holding a black candle');
            await npc.say('This will summon the demon Thrantax');
            await npc.say('You will need to bind him with magic words');
            await npc.say('Then you will need the sword Excalibur with which the spell was bound');
            await npc.say('Shatter the crystal with Excalibur');

            const subOpt = await player.ask([
                'So where can I find Excalibur?',
                'OK I will do all that',
                'What are the magic words?'
            ], true);

            if (subOpt === 0) {
                await npc.say('The lady of the lake has it');
                await npc.say("I don't know if she will give it you though");
                await npc.say('She can be rather temperamental');
            } else if (subOpt === 2) {
                await npc.say('You will find the magic words at the base of one of the chaos altars');
                await npc.say('Which chaos altar I cannot remember');
            }
        }
        return true;
    }

    return false;
}

// Object interaction - Chaos Altar for magic words
function onOperateObject(player, object) {
    if (object.id === OBJ_CHAOS_ALTAR) {
        player.message('You find a small inscription');
        player.message('Snarthon Candtrick Termanto');
        player.cache.magic_words = true;
        return true;
    }
    return false;
}

// Use Excalibur on Crystal
function onUseItemOnObject(player, item, object) {
    if (object.id === OBJ_MERLIN_CRYSTAL && item.id === ITEM_EXCALIBUR) {
        const stage = getQuestStage(player);
        if (stage === 4) {
            player.message('The crystal shatters!');
            player.message('Merlin says: Thank you! It\'s not fun being trapped in a giant crystal');
            player.message('Merlin says: Go speak to King Arthur, I\'m sure he\'ll reward you');
            player.message('You have set Merlin free, now talk to King Arthur');
            setQuestStage(player, 5);
        } else {
            player.message('Nothing interesting happens');
        }
        return true;
    }
    return false;
}

// Drop bat bones at pentagram to summon Thrantax
function onDropItem(player, item) {
    if (item.id === ITEM_BAT_BONES && player.cache.magic_words) {
        // Check if player has lit black candle
        if (player.inventory.has(ITEM_LIT_BLACK_CANDLE)) {
            player.message('Suddenly a demon appears!');
            player.message('Demon: rarrrrgh');

            // Give player dialogue choices
            const stage = getQuestStage(player);
            if (stage === 3) {
                // Player needs to say correct magic words
                player.message('Now what were those magic words?');
                // The correct answer is "Snarthon Candtrick Termanto"
                // For simplicity, advance quest
                player.message('You say: Snarthon Candtrick Termanto');
                player.message('Demon: You have me in your control');
                player.message('Demon: What do you wish of me?');
                player.message('You say: I wish to free Merlin from his giant crystal');
                player.message('Demon: It is done, you can now shatter Merlins crystal with Excalibur');
                setQuestStage(player, 4);
            }
            return true;
        }
    }
    return false;
}

// Kill Sir Mordred triggers Morgan Le Faye dialogue
function onKillNpc(player, npc) {
    if (npc.id === NPC_SIR_MORDRED) {
        const stage = getQuestStage(player);
        if (stage >= 1) {
            player.message('Morgan Le Faye appears!');
            // The onTalkToNpc for Morgan Le Faye would handle the rest
        }
        return true;
    }
    return false;
}

// Lady of the Lake test (beggar gives bread = Excalibur)
function onGiveItem(player, npc, item) {
    if (npc.id === NPC_BEGGAR && item.id === ITEM_BREAD) {
        if (player.cache.lady_test) {
            player.inventory.remove(ITEM_BREAD, 1);
            player.message('You give the bread to the beggar');
            player.message('The beggar has turned into the Lady of the Lake!');
            player.message('Lady: Well done, you have passed my test');
            player.message('Lady: Here is Excalibur, guard it well');
            player.inventory.add(ITEM_EXCALIBUR, 1);
            delete player.cache.lady_test;
            return true;
        }
    }
    return false;
}

module.exports = {
    name: 'merlins-crystal',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onOperateObject,
    onUseItemOnObject,
    onDropItem,
    onKillNpc,
    onGiveItem,
    npcs: [NPC_KING_ARTHUR, NPC_SIR_GAWAIN, NPC_SIR_LANCELOT, NPC_SIR_MORDRED, NPC_MORGAN_LE_FAYE, NPC_THRANTAX, NPC_BEGGAR],
    objects: [OBJ_MERLIN_CRYSTAL, OBJ_CHAOS_ALTAR, OBJ_BEEHIVE]
};
