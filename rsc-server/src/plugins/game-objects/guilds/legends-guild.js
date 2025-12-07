const QUEST_NAME = "Legends Quest";

module.exports = {
    type: 'object',
    ids: [1079], // Wrought Mithril Gates

    async onObjectAction(player, object, click) {
        // Legends' Guild Gate (Approximate coordinates 515, 450)
        // Adjust coordinate check if reused elsewhere, but ID 1079 is unique to Legend's Guild ideally.

        const stage = player.questStages[QUEST_NAME];

        if (stage !== undefined && stage >= 0) {
            player.message("You open the gate and walk through.");

            // Teleport logic (East/West handling for gate at X=515)
            if (player.x >= 515) {
                player.teleport(514, 450); // Enter (West)
            } else {
                player.teleport(515, 450); // Exit (East)
            }
        } else {
            player.message("The gate is locked.");
            player.message("You should speak to the guard.");
        }
        return true;
    }
};
