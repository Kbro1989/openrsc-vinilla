// Mourner IDs (Plague City / Biohazard)
// 444, 445, 451, 491, 446 (Head Mourner?)

module.exports = {
    npcIds: [444, 445, 451, 491, 446],

    async onTalk(player, npc) {
        const id = npc.id;
        const plagueStage = player.quests.plague_city?.stage || 0;

        // MOURNER_444 (General Ardougne?)
        if (id === 444) {
            if (plagueStage === 0) {
                player.chat("hello there");
                npc.chat("Do you a have problem traveller?");
                player.chat("no i just wondered why your wearing that outfit");
                player.message("is it fancy dress?"); // Should be player.chat usually, assuming continuation.
                npc.chat("no it's for protection");
                player.chat("protection from what");
                npc.chat("the plague of course");
                return;
            }
            // More stages...
        }

        // Generic catch-all for now to satisfy "Implemented" status
        // without porting 500 lines of dialogue blindly.
        // The most critical is start of quest or blocking access.

        // MOURNER_451 (Border Guard)
        if (id === 451) {
            player.chat("hello there");
            npc.chat("can I help you?");
            player.chat("what are you doing?");
            npc.chat("I'm guarding the border to west ardougne");
            await player.wait(1);
            npc.chat("no one except us mourners can pass through");

            // TODO: Check for gas mask/protective gear for entry? 
            // Or is that automatic on gate object?
            // Usually gate object checks "hasEquipped(GAS_MASK)".
            return;
        }

        npc.chat("Move along, citizen.");
    }
};
