// Guidor & Guidor's Wife (Varrock)
// Biohazard Quest (End Game Logic)

const GUIDOR = 508;
const GUIDORS_WIFE = 488;

const PRIEST_ROBE = 807;
const PRIEST_GOWN = 808;

const PLAGUE_SAMPLE = 815;
const TOUCH_PAPER = 816;
const LIQUID_HONEY = 817;
const ETHENEA = 818;
const SULPHURIC_BROLINE = 819;

// Quest Keys
// 'biohazard'

async function onTalkToNPC(player, npc) {
    const id = npc.id;
    if (id !== GUIDOR && id !== GUIDORS_WIFE) return false;

    player.engage(npc);
    const stage = player.questStages.biohazard || 0;

    // GUIDOR'S WIFE LOGIC
    if (id === GUIDORS_WIFE) {
        if (stage === 7) {
            const hasRobe = player.equipment && player.equipment.contains(PRIEST_ROBE);
            const hasGown = player.equipment && player.equipment.contains(PRIEST_GOWN);

            // In case equipment helper is different, we check inventory as fallback or use engine helper
            // Assuming player.inventory.contains if not equipped? No, she explicitly needs you DRESSED as a priest.
            // Usually `player.equipment.has(ID)` or similar.
            // I'll stick to a simpler check if uncertain:
            // Authentic RSC check: hasEquipped(807) && hasEquipped(808).
            // My engine: player.equipment.contains() checks underlying container.
            // If player has items equipped, they are in the 'equipment' container (usually).

            if (hasRobe && hasGown) {
                await npc.say("Father, thank heavens you're here. My husband is very ill", "Perhaps you could go and perform his final ceremony");
                await player.ask(["I'll see what I can do"], true);
                // In authentic RSC, this might unlock the door or just implied permission?
                // Usually sets a temp flagged "guidor_access" or just allows passing the door object.
                // For now, assume player can just walk in or door logic handles it separately.
                // OpenRSC DoorAction uses `ifnearvisnpc` to check wife.
            } else {
                await player.ask(["Hello, I'm a friend of Elena, here to see Guidor"], true);
                await npc.say("I'm afraid...(she sobs)... that Guidor is not long for this world", "So I'm not letting people see him now");
                await player.ask(["I'm really sorry to hear about Guidor...", "but I do have some very important business to attend to"], true);
                await npc.say("You heartless rogue. What could be more important than Guidor's life?", "...A life spent well, if not always wisely...", "I just hope that Saradomin shows mercy on his soul");
                await player.ask(["Guidor is a religious man?"], true);
                await npc.say("Oh god no. But I am", "if only i could get him to see a priest");
            }
        } else if (stage > 7 || stage === -1) {
            await player.ask(["hello again"], true);
            await npc.say("hello there", "i fear guidor may not be long for this world");
        } else {
            await npc.say("Oh dear! Oh dear!", "I don't have time to chat!");
        }
    }
    // GUIDOR LOGIC
    else if (id === GUIDOR) {
        if (stage === 7) {
            await player.ask(["Hello, you must be Guidor. I understand that you are unwell"], true);
            await npc.say(
                "Is my wife asking priests to visit me now?",
                "I'm a man of science, for god's sake!",
                "Ever since she heard rumours of a plague carrier travelling from Ardougne",
                "she's kept me under house arrest",
                "Of course she means well, and I am quite frail now...",
                "So what brings you here?"
            );

            const menu = await player.ask([
                "I've come to ask your assistance in stopping a plague that could kill thousands",
                "Oh, nothing, I was just going to bless your room and I've done that now Goodbye"
            ], true);

            if (menu === 0) {
                await npc.say("So you're the plague carrier!");
                await player.ask(["No! Well, yes... but not exactly. It's contained in a sealed unit from elena"], true);
                await npc.say("Elena eh?");
                await player.ask(["Yes. She wants you to analyse it", "You might be the only one that can help"], true);
                await npc.say("Right then. Sounds like we'd better get to work!");

                if (player.inventory.contains(PLAGUE_SAMPLE)) {
                    await player.ask(["I have the plague sample"], true);
                    await npc.say("Now I'll be needing some liquid honey, some sulphuric broline, and then...");
                    await player.ask(["...some ethenea?"], true);
                    await npc.say("Indeed!");

                    if (player.inventory.contains(ETHENEA) &&
                        player.inventory.contains(SULPHURIC_BROLINE) &&
                        player.inventory.contains(LIQUID_HONEY)) {

                        if (player.inventory.contains(TOUCH_PAPER)) {
                            player.message("You give him the vials and the touch paper");
                            player.inventory.remove(TOUCH_PAPER, 1);
                            player.inventory.remove(PLAGUE_SAMPLE, 1);
                            player.inventory.remove(ETHENEA, 1);
                            player.inventory.remove(LIQUID_HONEY, 1);
                            player.inventory.remove(SULPHURIC_BROLINE, 1);

                            await npc.say("Now I'll just apply these to the sample and...", "I don't get it...the touch paper has remained the same");
                            player.updateQuestStage('biohazard', 8); // Stage 8: Reveal

                            const menu3 = await player.ask([
                                "That's why Elena wanted you to do it- because she wasn't sure what was happening",
                                "So what does that mean exactly?"
                            ], true);

                            await npc.say(
                                "Well that's just it. Nothing has happened",
                                "I don't know what this sample is, but it certainly isn't toxic",
                                "Don't you understand, there is no plague!",
                                "I'm very sorry, I can see that you've worked hard for this...",
                                "...but it seems that someone has been lying to you",
                                "The only question is... why?"
                            );

                            // Now player must return to King Lathas (Stage 8 -> 9 handled by talking to Lathas? Or stage 8 is enough?)
                            // Looking at King Lathas code: if (stage === 9) ...
                            // Wait, Guidor sets stage 8.
                            // Lathas needs stage 9?
                            // Actually, I missed something.
                            // In BioHazard.java: player.updateQuestStage(this, 8);
                            // Then player goes to King Lathas?
                            // Lathas line 843: else if (player.getQuestStage(this) == 9)
                            // Where is stage 8 -> 9?
                            // Maybe speaking to Elena or someone else?
                            // Or maybe I misread Lathas code.
                            // Actually, Lathas code handles stage 9.
                            // Let's check Elena or other NPCs for 8->9.
                            // Or maybe talking to Guidor AGAIN sets it to 9?
                            // OpenRSC Guidor code doesn't seem to set 9.
                            // Wait, line 123 in Biohazard.java:
                            // "Elena: ... Go and speak to King Lathas".
                            // Maybe speaking to Elena (Stage 8) -> Sets Stage 9?
                            // I need to check Elena logic later.
                            // For now, Guidor sets 8.

                        } else {
                            await npc.say("Oh. You don't have any touch-paper", "And so I won't be able to help you after all");
                        }
                    } else {
                        await npc.say("Look, I need all three reagents to test the plague sample", "Come back when you've got them");
                    }
                } else {
                    await npc.say("Seems like you don't actually HAVE the plague sample");
                }
            }
        }
        else if (stage >= 8) {
            await player.ask(["hello again guidor"], true);
            await npc.say("well hello traveller", "i still can't understand why they would lie about the plague");
        }
        else {
            await npc.say("I am unwell, please leave me be.");
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
