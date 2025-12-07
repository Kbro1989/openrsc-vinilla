// Oracle NPC (Dragon Slayer)
// ID 520 (Common RSC ID for Oracle)

module.exports = {
    npcIds: [520],

    async onTalk(player, npc) {
        const questStage = player.quests.dragon_slayer?.stage || 0;

        // OpenRSC: if stage == 2 (Started, Oziach sent you?)
        // Oracle gives map piece info.

        // Logic:
        // if stage == 2:
        // Opt: "I seek a piece of the map..."
        // Opt: "Can you impart your wise knowledge..."

        // Authentic Text:
        // "The map's behind a door below"
        // "But entering is rather tough"
        // "And this is what you need to know"
        // "You must hold the following stuff"
        // "First a drink used by the mage" (Wizard Mind Bomb)
        // "Next some worm string, changed to sheet" (Silk)
        // "Then a small crustacean cage" (Lobster Pot)
        // "Last a bowl that's not seen heat" (Unfired Bowl)

        const options = [];

        if (questStage === 2) {
            options.push("I seek a piece of the map of the isle of Crandor");
        }

        options.push("Can you impart your wise knowledge to me oh oracle");

        const selection = await player.ask(options);
        if (selection === -1) return;

        const chosen = options[selection];

        if (chosen === "I seek a piece of the map of the isle of Crandor") {
            player.message("The map's behind a door below");
            await player.wait(1);
            player.message("But entering is rather tough");
            await player.wait(1);
            player.message("And this is what you need to know");
            await player.wait(1);
            player.message("You must hold the following stuff");
            await player.wait(1);
            player.message("First a drink used by the mage");
            await player.wait(1);
            player.message("Next some worm string, changed to sheet");
            await player.wait(1);
            player.message("Then a small crustacean cage");
            await player.wait(1);
            player.message("Last a bowl that's not seen heat");
        } else {
            const randoms = [
                "You must search from within to find your true destiny",
                "No crisps at the party",
                "It is cunning, almost foxlike",
                "Is it waking up time, I'm not quite sure",
                "When in Asgarnia do as the Asgarnians do",
                "The light at the end of the tunnel is the demon infested lava pit",
                "Watch out for cabbages they are green and leafy",
                "Too many cooks spoil the anchovie pizza"
            ];
            const randomMsg = randoms[Math.floor(Math.random() * randoms.length)];
            npc.chat(randomMsg);
        }
    }
};
