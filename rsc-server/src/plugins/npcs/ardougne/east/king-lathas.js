

module.exports = (router) => {
    // King Lathas (ID 512)
    router.on('talk', 512, (player, npc) => {
        npc.message('Greetings traveller', 'I am King Lathas of Ardougne');

        player.options('I am in search of a quest', 'Do you have any news?', (option) => {
            if (option === 0) {
                player.message('I am in search of a quest');
                // Placeholder for potential future quests (Plague City / Biohazard)
                npc.message('I may have work for you in the future', 'But for now my guards handle most matters');
            } else {
                player.message('Do you have any news?');
                npc.message('The west is wild and dangerous', 'We do our best to keep the peace here in the East');
            }
        });
    });
};
