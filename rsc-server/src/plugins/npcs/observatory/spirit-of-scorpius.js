// Spirit of Scorpius (Observatory Quest)
// Location: Grave of Scorpius (Ardougne West / Observatory)

const SPIRIT_OF_SCORPIUS = 665;
const GRAVE_OF_SCORPIUS = 941;

// Items
const UNHOLY_SYMBOL_OF_ZAMORAK = 1029; // Blessed & Stringed? Or just Blessed? OpenRSC uses this ID.
const UNBLESSED_UNHOLY_SYMBOL = 1028;
const UNHOLY_SYMBOL_MOULD = 1026;

// Quest Keys
// 'observatory'

async function onTalkToNPC(player, npc) {
    if (npc.id !== SPIRIT_OF_SCORPIUS) {
        return false;
    }

    player.engage(npc);

    // Check quest stage
    const observatoryStage = player.questStages.observatory || 0;

    if (observatoryStage === -1) { // Quest complete
        await npc.say("How dare you disturb me!");
        player.disengage();
        return true;
    }

    // If player has mould flagged in cache
    /* 
    if (player.getCache().hasKey("scorpius_mould")) ...
    Simplify: Always offer options if quest is active?
    OpenRSC logic: if player has key "scorpius_mould" OR active quest logic.
    "scorpius_mould" key is set after he gives you one.
    */

    // Simplified authentic logic:
    const menu = await player.ask([
        "I have come to seek a blessing",
        "I need another unholy symbol mould",
        "I have come to kill you"
    ], true);

    if (menu === 0) {
        // Blessing
        if (player.inventory.contains(UNHOLY_SYMBOL_OF_ZAMORAK)) { // Already has blessed
            await npc.say(
                "I see you have the unholy symbol of our Lord",
                "It is blessed with the Lord Zamorak's power",
                "Come to me when your faith weakens"
            );
        } else if (player.inventory.contains(UNBLESSED_UNHOLY_SYMBOL)) {
            await npc.say(
                "I see you have the unholy symbol of our Lord",
                "I will bless it for you"
            );
            player.message("The ghost mutters in a strange voice");
            player.inventory.remove(UNBLESSED_UNHOLY_SYMBOL, 1);
            player.inventory.add(UNHOLY_SYMBOL_OF_ZAMORAK, 1);
            player.message("The unholy symbol throbs with power");
            await npc.say(
                "The symbol of our lord has been blessed with power!",
                "My master calls..."
            );
        } else {
            await npc.say(
                "No blessings will be given to those",
                "Who have no symbol of our Lord's love!"
            );
        }
    } else if (menu === 1) {
        // Mould
        if (player.inventory.contains(UNHOLY_SYMBOL_MOULD)) {
            await npc.say("One you already have, another is not needed", "Leave me be!");
        } else {
            await npc.say(
                "To lose an object is easy to replace",
                "To lose the affections of our lord is impossible to forgive..."
            );
            player.message("The ghost hands you another mould");
            player.inventory.add(UNHOLY_SYMBOL_MOULD, 1);
        }
    } else if (menu === 2) {
        // Kill
        await npc.say("The might of mortals to me is as the dust is to the sea!");
        // Maybe start combat? OpenRSC starts combat with GHOST_SCORPIUS?
        // Or just attacks player?
        // npc.attack(player);
    }

    player.disengage();
    return true;
}

// Object listener (Grave)
async function onObjectAction(player, object, cmd) {
    if (object.id === GRAVE_OF_SCORPIUS) {
        player.message("Here lies Scorpius:");
        player.message("Only those who have seen beyond the stars");
        player.message("may seek his counsel");
        return true;
    }
    return false;
}

module.exports = { onTalkToNPC, onObjectAction };
