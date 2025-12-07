const QUEST_NAME = 'Temple of Ikov';
const QUEST_POINTS = 1;

// NPCs
const NPC_LUCIEN = 364;       // Flying Horse Inn
const NPC_LUCIEN_EDGE = 365;  // Edgeville shack
const NPC_WINELDA = 366;      // Witch by lava
const NPC_GUARDIAN_FEMALE = 367;
const NPC_GUARDIAN_MALE = 368;
const NPC_FIRE_WARRIOR = 369;

// Items
const ITEM_PENDANT_LUCIEN = 720;
const ITEM_PENDANT_ARMADYL = 721;
const ITEM_STAFF_ARMADYL = 722;
const ITEM_ICE_ARROWS = 723;
const ITEM_LIMPWURT = 220;
const ITEM_LEVER = 725;
const ITEM_LIT_CANDLE = 36;
const ITEM_LIT_TORCH = 249;

// Objects
const OBJ_STAIR_DOWN = 370;
const OBJ_STAIR_UP = 369;
const OBJ_LEVER = 361;
const OBJ_LEVER_BRACKET = 367;
const OBJ_COMPLETE_LEVER = 368;

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

async function onTalkToNPC(player, npc) {
    const stage = getQuestStage(player);

    // Lucien at Flying Horse Inn - starts quest
    if (npc.id === NPC_LUCIEN) {
        if (stage === 0) {
            await npc.say('I seek a hero to enter Temple of Ikov tunnels.');
            await npc.say('Kill the Fire Warrior of Lesarkus and retrieve Staff of Armadyl.');
            const choice = await player.ask(['I am a hero!', 'Sounds too dangerous'], true);
            if (choice === 0) {
                await npc.say('Take this pendant for the Chamber of Fear.');
                await npc.say('Meet me at my shack north of Varrock when done.');
                player.inventory.add(ITEM_PENDANT_LUCIEN, 1);
                setQuestStage(player, 1);
            }
        } else if (stage >= 1) {
            if (!player.inventory.has(ITEM_PENDANT_LUCIEN) && stage !== 2) {
                await npc.say('Lost the pendant? Here\'s another, imbecile.');
                player.inventory.add(ITEM_PENDANT_LUCIEN, 1);
            } else {
                await npc.say('Do not meet me here again. Go to my shack!');
            }
        }
        return true;
    }

    // Lucien at Edgeville - gives staff for evil ending
    if (npc.id === NPC_LUCIEN_EDGE) {
        if (stage === -1 || stage === -2) {
            player.message('You have already completed this quest');
            return true;
        }
        await npc.say('Have you got the Staff of Armadyl yet?');
        if (player.inventory.has(ITEM_STAFF_ARMADYL)) {
            const choice = await player.ask(['Yes, here it is', 'Not yet'], true);
            if (choice === 0) {
                player.inventory.remove(ITEM_STAFF_ARMADYL, 1);
                await npc.say('Muhahahaha! Already I feel its power!');
                await npc.say('I shall grant you power as your reward.');
                player.addExperience('ranged', 10500);
                player.addExperience('fletching', 8000);
                player.addQuestPoints(QUEST_POINTS);
                setQuestStage(player, -2); // Evil ending
                player.message('You have completed the Temple of Ikov!');
            }
        } else {
            await player.say('No, not yet.');
        }
        return true;
    }

    // Winelda - teleports across lava
    if (npc.id === NPC_WINELDA) {
        if (player.inventory.count(ITEM_LIMPWURT) >= 20) {
            await player.say('I have 20 limpwurt roots.');
            await npc.say('Marvellous! Brace yourself!');
            player.inventory.remove(ITEM_LIMPWURT, 20);
            player.teleport(557, 3290);
        } else {
            await npc.say('Want to cross the lava stream?');
            await npc.say('Bring me 20 limpwurt roots and I\'ll teleport you.');
        }
        return true;
    }

    // Guardians of Armadyl - good path
    if (npc.id === NPC_GUARDIAN_FEMALE || npc.id === NPC_GUARDIAN_MALE) {
        if (stage === 2) {
            await npc.say('Any luck against Lucien?');
            if (!player.inventory.has(ITEM_PENDANT_ARMADYL)) {
                await npc.say('Here, take another pendant.');
                player.inventory.add(ITEM_PENDANT_ARMADYL, 1);
            }
            return true;
        }
        if (stage === -1) {
            await player.say('I have defeated Lucien!');
            await npc.say('Well done. We hope that keeps him quiet a while.');
            return true;
        }

        if (player.equipment.has(ITEM_PENDANT_LUCIEN)) {
            await npc.say('Ahh! A foul agent of Lucien! Begone!');
            npc.setTarget(player);
            return true;
        }

        await npc.say('Thou dost venture deep in the tunnels.');
        const choice = await player.ask(['I seek the Staff of Armadyl', 'Who are you?'], true);
        if (choice === 0) {
            await npc.say('We guard it. Why dost thou seek it?');
            const reason = await player.ask(['Lucien is paying me', 'I collect artifacts'], true);
            if (reason === 0) {
                await npc.say('Lucien?! You must be cleansed!');
                const cleanse = await player.ask(['How dare you call me fool!', 'Yes I could use a bath'], true);
                if (cleanse === 1) {
                    player.message('The guardian splashes holy water on you.');
                    await npc.say('Now you know where Lucien lurks. Help us!');
                    await npc.say('Wear this pendant to attack him.');
                    player.inventory.add(ITEM_PENDANT_ARMADYL, 1);
                    setQuestStage(player, 2);
                } else {
                    npc.setTarget(player);
                }
            }
        } else {
            await npc.say('We are Guardians of Armadyl. We protect this place.');
        }
        return true;
    }

    return false;
}

async function onOpLoc(player, object) {
    const stage = getQuestStage(player);

    // Stairs down - need light source
    if (object.id === OBJ_STAIR_DOWN) {
        if (player.inventory.has(ITEM_LIT_CANDLE) || player.inventory.has(ITEM_LIT_TORCH)) {
            player.message('Your flame lights up the room.');
            player.teleport(537, 3372);
        } else {
            player.message('It is too dark. You need a light source.');
            player.teleport(537, 3394);
        }
        return true;
    }

    // Lever with trap
    if (object.id === OBJ_LEVER) {
        if (!player.getCache('ikovLever')) {
            player.message('You activate a trap on the lever!');
            player.damage(Math.ceil(player.skills.hits / 5));
        } else {
            player.message('You pull the lever. You hear a clunk.');
            player.removeCache('ikovLever');
            player.setCache('openSpiderDoor', true);
        }
        return true;
    }

    return false;
}

async function onKillNpc(player, npc) {
    // Kill Fire Warrior with ice arrows
    if (npc.id === NPC_FIRE_WARRIOR) {
        player.setCache('killedLesarkus', true);
        player.message('The Fire Warrior is defeated!');
        return true;
    }

    // Kill Lucien - good ending
    if (npc.id === NPC_LUCIEN_EDGE) {
        if (getQuestStage(player) === 2 && player.equipment.has(ITEM_PENDANT_ARMADYL)) {
            await npc.say('You may have defeated me... but I will be back!');
            player.addExperience('ranged', 10500);
            player.addExperience('fletching', 8000);
            player.addQuestPoints(QUEST_POINTS);
            setQuestStage(player, -1); // Good ending
            player.message('You have completed the Temple of Ikov!');
        }
        return true;
    }
    return false;
}

module.exports = {
    name: 'temple-of-ikov',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNPC,
    onOpLoc,
    onKillNpc,
    npcs: [NPC_LUCIEN, NPC_LUCIEN_EDGE, NPC_WINELDA, NPC_GUARDIAN_FEMALE, NPC_GUARDIAN_MALE, NPC_FIRE_WARRIOR],
    objects: [OBJ_STAIR_DOWN, OBJ_LEVER, OBJ_COMPLETE_LEVER]
};
