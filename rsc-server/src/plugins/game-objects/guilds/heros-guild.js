const QUEST_NAME = "Hero's Quest";

module.exports = {
    type: 'object',
    ids: [78, 58, 59, 60, 61], // 78 (from quest), 58-61 (gates)

    async onObjectAction(player, object, click) {
        // Hero's Guild Main Door (Approximate coordinates based on research)
        if (object.x === 457 && object.y === 377) {
            const stage = player.questStages[QUEST_NAME] || 0;

            if (stage === -1) {
                player.message("You open the door and enter the Hero's Guild");

                // Teleport to other side
                if (player.x >= 457) {
                    player.teleport(456, 377); // Enter
                } else {
                    player.teleport(458, 377); // Exit
                }
            } else {
                player.message("You need to be a Hero to enter here.");
                player.message("Talk to Achietties at the entrance.");
            }
            return true;
        }
        return false;
    }
};
