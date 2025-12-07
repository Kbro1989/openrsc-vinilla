// https://classic.runescape.wiki/w/Transcript:Kaqemeex

const KAQEMEEX_ID = 219; // Need to verify ID, assuming 219 for now based on list order or lookup

async function onTalkToNPC(player, npc) {
    // Only handle Kaqemeex
    if (npc.id !== KAQEMEEX_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Hello there traveler.');

    const choice = await player.ask([
        'Who are you?',
        'What is this place?',
        'Can you teach me about Herblaw?'
    ]);

    if (choice === 0) {
        await npc.say(
            'I am Kaqemeex.',
            'I am one of the druids of this circle.',
            'We worship Guthix, the god of balance.'
        );
    } else if (choice === 1) {
        await npc.say(
            'This is the stone circle of Taverley.',
            'It is a holy place for us druids.'
        );
    } else if (choice === 2) {
        await npc.say(
            'Herblaw is the ancient art of potion making.',
            'To practice it, you must first find herbs.',
            'Some herbs are dirty and must be identified first.',
            'Then, you can mix them into a vial of water.',
            'Finally, add a secondary ingredient to complete the potion.'
        );

        await player.say('Sounds complicated.');

        await npc.say(
            'It takes patience and knowledge.',
            'Start with Guam leaves. They are common and easy to work with.',
            'Mix a clean Guam leaf with a vial of water, then add an Eye of Newt.',
            'That will create an Attack Potion.'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
