// https://classic.runescape.wiki/w/Transcript:Lumbridge_Guide

const GUIDE_ID = 196;

async function onTalkToNPC(player, npc) {
    if (npc.id !== GUIDE_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Greetings adventurer', 'I am the Lumbridge Guide');
    await player.say('Hello');
    await npc.say(
        'I am here to give information and help to new players',
        'Do you have any questions?'
    );

    const choice = await player.ask([
        'Where can I find money?',
        'Where can I find quests?',
        'Where can I find monsters to kill?',
        'I am fine for now thanks'
    ]);

    switch (choice) {
        case 0: // Money
            await npc.say(
                'There are many ways to make money',
                'You can kill monsters and take their loot',
                'Or you can learn a trade skill like fishing or woodcutting',
                'You can sell your goods to the general store'
            );
            break;
        case 1: // Quests
            await npc.say(
                'There are many quests to be found',
                'Talk to the Duke in the castle',
                'Or the Cook in the kitchen'
            );
            break;
        case 2: // Monsters
            await npc.say(
                'There are goblins across the river to the east',
                'And giant rats in the swamps to the south',
                'Be careful though, they can be dangerous'
            );
            break;
        case 3: // Fine
            await npc.say('Good luck adventurer');
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
