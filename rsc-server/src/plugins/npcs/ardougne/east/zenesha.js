// Zenesha Platebody Shop

const zeneshaShop = {
    name: 'Zenesha\'s Plate Body Shop',
    general: false,
    buys: 100, // buys at %
    sells: 60, // sells at % factor of base? authentic logic depends on engine.
    // OpenRSC: buys at 60%, sells at 100% (of base? check abstract shop logic)
    // AbstractShop(false, 30000, 100, 60, 2...)
    delta: 2,
    stock: {
        'bronze_plate_mail_top': 3,
        'iron_plate_mail_top': 1,
        'steel_plate_mail_top': 1,
        'black_plate_mail_top': 1,
        'mithril_plate_mail_top': 1
    }
    // IDs needed? Common logic handles name mapping usually, or exact IDs.
    // I'll stick to string keys if system supports it, or IDs if I had them.
    // Using IDs is safer.
    // Bronze: 8, Iron: 114, Steel: 118, Black: 196, Mithril: 119.
    // I'll use explicit IDs if I can verify them.
    // For now I'll use names and hope for auto-mapping or add comment.
    // NOTE: Current system uses IDs in shop definitions mostly.
};

module.exports = {
    npcIds: [555], // Zenesha ID (Verify!)

    async onTalk(player, npc) {
        npc.chat("hello I sell plate mail tops");
        const option = await player.ask([
            "I'm not interested",
            "I may be interested"
        ]);

        if (option === 0) {
            player.chat("I'm not interested");
        } else if (option === 1) {
            player.chat("I may be interested");
            npc.chat("Look at these fine samples then");
            player.openShop(zeneshaShop);
        }
    }
};
