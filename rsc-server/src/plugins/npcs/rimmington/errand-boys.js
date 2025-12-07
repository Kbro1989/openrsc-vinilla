// Errand Boys (Hops, Chancy, DeVinci)
// Biohazard Quest
// Locations: Rimmington (Give Vials), Varrock (Retrieve Vials)

const HOPS_RIM = 506;
const HOPS_VAR = 510;
const CHANCY_RIM = 505;
const CHANCY_VAR = 509;
const DEVINCI_RIM = 507;
const DEVINCI_VAR = 511;

const ETHENEA = 818;
const LIQUID_HONEY = 817;
const SULPHURIC_BROLINE = 819;

// In authentic RSC, they accept ANY vial, but Hops drinks one?
// Logic:
// Hops: Drinks Sulphuric Broline (Fail?) or just Hops drinks it? 
// Actually openRSC says:
// Hops: "I suppose I'd better get going... I'll meet you at The dancing donkey inn".
// If given Sulphuric Broline: "Ok I'll see you in Varrock".
// If given Ethenea/Honey: (Cache logic seems to track which one is given).
// Wait, OpenRSC logic:
// `player.getCache().store("wrong_vial_hops", true);` if given Ethenea/Honey?
// `vial_hops` = true if given Sulphuric Broline?
// Wait, Hops drinks it?
// Line 441 in Biohazard: "Please tell me that you haven't drunk the contents".
// So if you give him the WRONG one (or right one?), he might drink it?
// Actually, OpenRSC logic uses `wrong_vial_*` keys.
// If you give Hops Sulphuric Broline -> `vial_hops`.
// If you give Hops Ethenea/Honey -> `wrong_vial_hops`.
// This implies Hops is SUPPOSED to take Sulphuric Broline? Or NOT?
// Let's check Guidor logic.
// Guidor needs ALL THREE: Ethenea, Honey, Broline.
// So you must deliver all three safely.
// Hops, Chancy, DeVinci carry them.
// If runscript/check implies `wrong_vial`, it means you gave the wrong person the wrong vial?
// Or maybe they have preferences?
// Chemist says: "One's a painter, one's a gambler, and one's a drunk".
// DeVinci (Painter), Chancy (Gambler), Hops (Drunk).
// If you give the Drunk (Hops) something drinkable (Honey?), he might drink it?
// Sulphuric Broline sounds dangerous/undrinkable.
// Ethenea?
// I'll stick to OpenRSC variable naming logic.

async function onTalkToNPC(player, npc) {
    const id = npc.id;

    // Dispatch
    if (id === HOPS_RIM || id === HOPS_VAR) return handleHops(player, npc, id === HOPS_VAR);
    if (id === CHANCY_RIM || id === CHANCY_VAR) return handleChancy(player, npc, id === CHANCY_VAR);
    if (id === DEVINCI_RIM || id === DEVINCI_VAR) return handleDeVinci(player, npc, id === DEVINCI_VAR);

    return false;
}

async function handleHops(player, npc, isVarrock) {
    player.engage(npc);
    const stage = player.questStages.biohazard || 0;

    if (isVarrock) {
        // Varrock Logic (Retrieve)
        if (stage === 7) {
            await player.ask(["hello there"], true);
            // TODO: Check cache for what he has
            // For now, simplify: recover whatever he has
            /*
            if (player.vars.vial_hops) {
                await npc.say("Don't worry I haven't drunk it", "Taste's disgusting");
                player.inventory.add(SULPHURIC_BROLINE, 1);
                player.vars.vial_hops = false; 
            }
            */
            // I'll implement prompt logic
        }
        player.message("Hops hiccups.");
    } else {
        // Rimmington Logic (Give)
        if (stage === 7) {
            // Already given?
            // if (player.vars.vial_hops || player.vars.wrong_vial_hops) ...

            await player.ask(["Hi, I've got something for you to take to Varrock"], true);
            await npc.say("Sounds like pretty thirsty work");
            // ...
            const choice = await player.ask([
                "You give him the vial of ethenea",
                "You give him the vial of liquid honey",
                "You give him the vial of sulphuric broline"
            ], true);

            // Logic to take item and set var
            // Assuming IDs: Ethenea=818, Honey=817, Broline=819
            if (choice === 0 && player.inventory.contains(ETHENEA)) {
                player.inventory.remove(ETHENEA, 1);
                player.vars.wrong_vial_hops = true;
                await npc.say("OK. I'll see you in Varrock");
            } else if (choice === 1 && player.inventory.contains(LIQUID_HONEY)) {
                player.inventory.remove(LIQUID_HONEY, 1);
                player.vars.wrong_vial_hops = true; // Honey is wrong for Hops? Maybe he drinks it?
                await npc.say("OK. I'll see you in Varrock");
            } else if (choice === 2 && player.inventory.contains(SULPHURIC_BROLINE)) {
                player.inventory.remove(SULPHURIC_BROLINE, 1);
                player.vars.vial_hops = true; // Correct?
                await npc.say("OK. I'll see you in Varrock");
            } else {
                player.message("You don't have that vial.");
            }
        } else {
            player.message("He is not in a fit state to talk");
        }
    }
    player.disengage();
    return true;
}

async function handleChancy(player, npc, isVarrock) {
    player.engage(npc);
    const stage = player.questStages.biohazard || 0;
    if (isVarrock) {
        player.message("Chancy looks busy.");
    } else {
        if (stage === 7) {
            await player.ask(["Hello, I've got a vial for you to take to Varrock"], true);
            // ...
            const choice = await player.ask([
                "You give him the vial of ethenea",
                "You give him the vial of liquid honey",
                "You give him the vial of sulphuric broline"
            ], true);

            if (choice === 1 && player.inventory.contains(LIQUID_HONEY)) {
                player.inventory.remove(LIQUID_HONEY, 1);
                player.vars.vial_chancy = true; // Correct?
                await npc.say("Right. I'll see you later in the dancing donkey inn");
            } else if (choice !== 1) {
                // Others are wrong
                player.vars.wrong_vial_chancy = true;
                // Remove logic...
                await npc.say("Right. I'll see you later in the dancing donkey inn");
            }
        } else {
            player.message("Chancy doesn't feel like talking");
        }
    }
    player.disengage();
    return true;
}

async function handleDeVinci(player, npc, isVarrock) {
    player.engage(npc);
    const stage = player.questStages.biohazard || 0;
    if (isVarrock) {
        player.message("DeVinci is contemplating art.");
    } else {
        if (stage === 7) {
            await player.ask(["Hello. i hear you're an errand boy for the chemist"], true);
            // ...
            const choice = await player.ask([
                "You give him the vial of ethenea",
                "You give him the vial of liquid honey",
                "You give him the vial of sulphuric broline"
            ], true);

            if (choice === 0 && player.inventory.contains(ETHENEA)) {
                player.inventory.remove(ETHENEA, 1);
                player.vars.vial_vinci = true; // Correct?
                await npc.say("OK. We're meeting at the dancing donkey in Varrock right?");
            } else if (choice !== 0) {
                player.vars.wrong_vial_vinci = true;
                await npc.say("OK. We're meeting at the dancing donkey in Varrock right?");
            }
        } else {
            player.message("Devinci does not feel sufficiently moved to talk");
        }
    }
    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
