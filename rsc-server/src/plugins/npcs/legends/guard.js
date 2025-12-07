const QUEST_NAME = "Legends Quest";

module.exports = (router) => {
    // Legends Guild Guard (ID 736)
    router.on('talk', [736], (player, npc) => {
        const stage = player.questStages[QUEST_NAME];

        if (stage >= 0) {
            player.message("The guard nods at you.");
            npc.message("Welcome back, Legend.");
        } else {
            npc.message("Halt! Only the greatest heroes may enter the Legends' Guild.");
            player.message("How do I get in?");
            npc.message("You must have completed 107 Quest Points to prove your worth.");

            if (player.questPoints >= 107) {
                player.message("I have " + player.questPoints + " Quest Points.");
                npc.message("Impressive. You may enter and speak to the Grand Vizier.");
                player.updateQuestStage(QUEST_NAME, 0); // Start the quest
            } else {
                player.message("I only have " + player.questPoints + " Quest Points.");
                npc.message("Come back when you are more experienced.");
            }
        }
    });
};
