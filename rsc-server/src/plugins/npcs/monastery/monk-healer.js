

module.exports = (router) => {
    // Monk Healer (ID 93) & Abbot Langley (ID 174)
    router.on('talk', [93, 174], (player, npc) => {
        npc.message('Greetings traveller');

        player.options('Can you heal me? I\'m injured', 'Isn\'t this place built a bit out the way?', (option) => {
            if (option === 0) {
                player.message('Can you heal me?');
                player.message('I\'m injured');
                npc.message('Ok');
                player.message('The monk places his hands on your head');

                setTimeout(() => {
                    player.message('You feel a little better');
                    // Heal 5 HP, up to Max
                    const current = player.skills.hits.current;
                    const max = player.skills.hits.level;
                    if (current < max) {
                        player.skills.hits.current = Math.min(max, current + 5);
                        player.sendStat(3); // 3 = Hits stat index
                    }
                }, 2000);
            } else {
                player.message('Isn\'t this place built a bit out the way?');
                npc.message('We like it that way', 'We get disturbed less', 'We still get rather a large amount of travellers', 'looking for sanctuary and healing here as it is');
            }
        });
    });
};
