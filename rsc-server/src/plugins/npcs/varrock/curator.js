module.exports = (router) => {
    // Curator (ID 39)
    const CURATOR_ID = 39;

    router.on('talk', CURATOR_ID, (player, npc) => {
        npc.message('Welcome to the museum of Varrock');

        player.options('Have you any interesting news?', 'Do you know where I can find the shield of Arrav?', (option) => {
            if (option === 0) {
                player.message('Have you any interesting news?');
                npc.message('No, I am only interested in ancient history', 'Not recent news');
            } else {
                player.message('Do you know where I can find the shield of Arrav?');
                npc.message('The shield of Arrav, one of the most famous artifacts in this area');
                npc.message('It was stolen from this very museum', 'About 5 years ago');
                player.message('Do you know who stole it?');
                npc.message('We are pretty sure it was the Phoenix Gang');
                npc.message('But no-one knows where their hideout is');
            }
        });
    });
};
