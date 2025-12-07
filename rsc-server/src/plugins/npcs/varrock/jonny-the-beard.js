module.exports = (router) => {
    // Jonny the Beard (ID 25)
    // Drops "Intel Report" (need ID) for Shield of Arrav.

    const JONNY_THE_BEARD_ID = 25;

    router.on('talk', JONNY_THE_BEARD_ID, (player, npc) => {
        player.message('You speak to the bearded man.');

        // Authentic Dialogue
        npc.message('Will you buy me a beer?');
        npc.message('I am so thirsty');

        player.options('Ok, I\'ll buy you a beer', 'No, I don\'t think I will', (option) => {
            if (option === 0) {
                player.message('Ok, I\'ll buy you a beer');
                if (player.inventory.contains(193)) { // Beer
                    player.inventory.remove(193, 1);
                    player.message('You give a beer to the man');
                    npc.message('Thanks mate');
                    player.message('The man downs the beer in one go');
                    npc.message('Start a tab for me will you?');

                    // If on quest assignment? 
                    // In OpenRSC, killing him triggers the report drop.
                    // Talking doesn't seem to advance quest directly, just flavor.
                    npc.message('You wouldn\'t believe the trouble I\'m in', 'I\'ve got to see a man about a shield');
                } else {
                    player.message('But I don\'t have one');
                    npc.message('Well get one then!');
                }
            } else {
                player.message('No, I don\'t think I will');
                npc.message('Pah, stingy');
            }
        });
    });
};
