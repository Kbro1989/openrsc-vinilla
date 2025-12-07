const COMMUNITY_INSTRUCTOR = 496;

async function onTalkToNPC(player, npc) {
    if (npc.id !== COMMUNITY_INSTRUCTOR) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "You're almost ready to go out into the main game area",
        "When you get out there",
        "You will be able to interact with thousands of other players"
    );

    await showMainMenu(player, npc);

    player.disengage();
    return true;
}

async function showMainMenu(player, npc) {
    const options = [
        "How can I communicate with other players?",
        "Are there rules on ingame behaviour?",
        "goodbye then"
    ];

    const menu = await player.ask(options);

    if (menu === 0) {
        await communicateDialogue(player, npc);
    } else if (menu === 1) {
        await behaviourDialogue(player, npc);
    } else if (menu === 2) {
        await npc.say("Good luck");
        if (player.cache.tutorial && player.cache.tutorial < 100) {
            player.cache.tutorial = 100;
        }
    }
}

async function communicateDialogue(player, npc) {
    await npc.say(
        "typing in the game window will bring up chat",
        "Which players in the nearby area will be able to see",
        "If you want to speak to a particular friend anywhere in the game",
        "You will be able to select the smiley face icon",
        "then click to add a friend, and type in your friend's name",
        "If that player is logged in on the same world as you",
        "their name will go green",
        "If they are logged in on a different world their name will go yellow",
        "clicking on their name will allow you to send a message"
    );
    await showMainMenu(player, npc);
}

async function behaviourDialogue(player, npc) {
    await npc.say(
        "Yes you should read the rules of conduct on our front page",
        "To make sure you do nothing to get yourself banned",
        "but as general guide always try to be courteous to people in game",
        "Remember the people in the game are real people somewhere",
        "With real feelings",
        "If you go round being abusive or causing trouble",
        "your character could quickly be the one in trouble"
    );
    await showMainMenu(player, npc);
}

module.exports = { onTalkToNPC };
