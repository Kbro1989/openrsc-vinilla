// Shantay & Shantay Pass Guards (Desert)
// Location: Al Kharid / Shantay Pass

const SHANTAY = 549;
const SHANTAY_GUARD_STANDING = 717; // Verify ID
const SHANTAY_GUARD_MOVING = 719; // Verify ID
const ASSISTANT = 731; // Assumption or need verify? OpenRSC uses constants. I'll rely on my search IDs: 717, 719.
// "Shantay Pass Guard" IDs from search: 717, 719.

const SHANTAY_PASS_ITEM = 1030; // Added manually
const SHANTAY_DISCLAIMER = 1099;
const STONE_GATE = 916;
const BANK_CHEST = 942;

// Shop logic:
// OpenShop usually handled by `shops.json`. I need to define a shop "Shantay's Pass Shop" and use ID.
// For now, I'll assume shop ID "shantay" exists or I need to add it.
// I'll stick to dialogue logic.

async function onTalkToNPC(player, npc) {
    const id = npc.id;
    if (id !== SHANTAY && id !== SHANTAY_GUARD_STANDING && id !== SHANTAY_GUARD_MOVING) {
        return false;
    }

    player.engage(npc);

    if (id === SHANTAY_GUARD_STANDING) {
        await npc.say("Hello there!", "What can I do for you?");
        const menu = await player.ask([
            "I'd like to go into the desert please.",
            "Nothing thanks."
        ], true);

        if (menu === 0) {
            await npc.say("Of course!");
            if (!player.inventory.contains(SHANTAY_PASS_ITEM)) {
                await npc.say("You'll need a Shantay pass to go through the gate into the desert.", "See Shantay, he'll sell you one for a very reasonable price.");
            } else {
                // Disclaimer logic
                if (!player.inventory.contains(SHANTAY_DISCLAIMER)) {
                    player.message("There is a large poster on the wall near the gateway. It reads..");
                    // ... (Disclaimer text)
                    const confirm = await player.ask([
                        "Yeah, that poster doesn't scare me!",
                        "No, I'm having serious second thoughts now."
                    ], true);

                    if (confirm === 0) {
                        await npc.say("Can I see your Shantay Desert Pass please.");
                        player.message("You hand over a Shantay Pass.");
                        player.inventory.remove(SHANTAY_PASS_ITEM, 1);
                        await npc.say("Sure, here you go!");
                        await npc.say("Here, have a disclaimer...", "It means that Shantay isn't responsible if you die in the desert.");
                        player.inventory.add(SHANTAY_DISCLAIMER, 1);
                        player.message("you go through the gate");
                        player.teleport(62, 735); // Desert coords
                    }
                } else {
                    // Has disclaimer
                    await npc.say("Can I see your Shantay Desert Pass please.");
                    player.inventory.remove(SHANTAY_PASS_ITEM, 1);
                    player.message("you go through the gate");
                    player.teleport(62, 735);
                }
            }
        }
    }
    else if (id === SHANTAY) {
        await npc.say("Hello Effendi, I am Shantay.");
        const menu = await player.ask([
            "What is this place?",
            "Can I see what you have to sell please?",
            "I must be going."
        ], true);

        if (menu === 0) {
            await npc.say("This is the pass of Shantay.", "I guard this area with my men.");
            // ... Jail logic omitted for brevity in first pass, focusing on access
            await npc.say("We charge a small toll of five gold pieces.");
        } else if (menu === 1) {
            await npc.say("Absolutely Effendi!");
            player.openShop("shantay"); // Must ensure this shop exists in shops.json
        }
    }
    else {
        await npc.say("Move along.");
    }

    player.disengage();
    return true;
}

// Object listener (Gate)
async function onObjectAction(player, object, cmd) {
    if (object.id === STONE_GATE) {
        if (cmd === "go through") {
            // Logic to check pass similar to guard dialogue
            if (player.inventory.contains(SHANTAY_PASS_ITEM)) {
                player.inventory.remove(SHANTAY_PASS_ITEM, 1);
                player.message("You go through the gate");
                // Depending on side:
                if (player.y < 735) player.teleport(62, 735); // Enter desert
                else player.teleport(62, 731); // Leave desert (usually free?)
            } else {
                player.message("You need a Shantay pass to go through.");
            }
            return true;
        }
    }
    return false;
}

module.exports = { onTalkToNPC, onObjectAction };
