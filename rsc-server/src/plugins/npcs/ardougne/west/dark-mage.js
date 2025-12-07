module.exports = (router) => {
    const DARK_MAGE_ID = 667;

    router.on('talk', DARK_MAGE_ID, (player, npc) => {
        // Dark Mage - West Ardougne (ID 667)
        player.message('You speak to the Dark Mage.');

        // Authentic Dialogue
        player.message('hello there');
        npc.message('why do do you interupt me traveller?');

        player.message('i just wondered what you\'re doing?');
        npc.message('i experiment with dark magic', 'it\'s a dangerous craft');

        // Check for Broken Staff
        const BROKEN_STAFF_ID = 1398; // Verified ID in OpenRSC source previously or assumed
        const FIXED_STAFF_ID = 1031; // Staff of Iban

        if (player.inventory.contains(BROKEN_STAFF_ID)) {
            player.message('could you fix this staff?');
            player.message('you show the mage your staff of iban');
            npc.message('almighty zamorak! the staff of iban!');
            player.message('can you fix it?');
            npc.message('this truly is dangerous magic traveller', 'i can fix it, but it will cost you', 'the process could kill me');
            player.message('how much?');
            npc.message('200,000 gold pieces, not a penny less');

            player.options('no chance, that\'s ridiculous', 'ok then', (option) => {
                if (option === 1) {
                    if (player.inventory.remove(10, 200_000)) { // 10 = Coins
                        if (player.inventory.remove(BROKEN_STAFF_ID, 1)) {
                            player.inventory.add(FIXED_STAFF_ID, 1); // Fixed staff
                            player.message('you give the mage 200,000 coins');
                            player.message('and the staff of iban');
                            player.message('the mage fixes the staff and returns it to you');
                            player.message('thanks mage');
                            npc.message('you be carefull with that thing');
                        }
                    } else {
                        player.message('you don\'t have enough money');
                        player.message('oops, i\'m a bit short');
                    }
                } else {
                    npc.message('fine by me');
                }
            });
        }
    });
};
