/**
 * Lost City Quest (Members)
 * 
 * Quest Stages:
 * 0 - Not started
 * 1 - Talked to adventurer, learned about leprechaun
 * 2 - Talked to leprechaun, learned about Dramen tree
 * 3 - Chopped the Dramen tree (spirit attacks)
 * 4 - Defeated the Tree Spirit
 * -1 - Complete (can access Zanaris)
 * 
 * Requirements:
 * - 36 Woodcutting to chop Dramen tree
 * - 31 Crafting to make Dramen staff
 * 
 * Reward: 3 Quest Points, access to Zanaris
 */

const QUEST_NAME = 'Lost City';
const QUEST_POINTS = 3;

// NPC IDs
const NPC_ADVENTURER_ARCHER = 219;
const NPC_ADVENTURER_CLERIC = 220;
const NPC_ADVENTURER_WARRIOR = 221;
const NPC_ADVENTURER_WIZARD = 222;
const NPC_LEPRECHAUN = 223;
const NPC_TREE_SPIRIT = 224;
const NPC_MONK_ENTRANA = 212;

// Item IDs
const ITEM_DRAMEN_BRANCH = 511;
const ITEM_DRAMEN_STAFF = 512;
const ITEM_KNIFE = 13;

// Object IDs
const OBJ_LEPRECHAUN_TREE = 237;
const OBJ_DRAMEN_TREE = 245;
const DOOR_ZANARIS = 66;

// Adventurer NPC IDs
const ADVENTURER_NPCS = [NPC_ADVENTURER_ARCHER, NPC_ADVENTURER_CLERIC, NPC_ADVENTURER_WARRIOR, NPC_ADVENTURER_WIZARD];

function getQuestStage(player) {
    return player.questStages[QUEST_NAME] || 0;
}

function setQuestStage(player, stage) {
    player.questStages[QUEST_NAME] = stage;
}

// NPC Talk handler
async function onTalkToNpc(player, npc) {
    const stage = getQuestStage(player);

    // Adventurer NPCs
    if (ADVENTURER_NPCS.includes(npc.id)) {
        if (stage === 0) {
            await npc.say('Hello traveller');
            const option = await player.ask([
                'What are you camped out here for?',
                'Do you know any good adventures I can go on?'
            ], true);

            if (option === 0) {
                await player.say('What are you camped here for?');
                await npc.say("We're looking for Zanaris");
                const subOption = await player.ask([
                    "Who's Zanaris?",
                    "What's Zanaris?",
                    "What makes you think it's out here?"
                ], true);

                if (subOption === 0 || subOption === 2) {
                    if (subOption === 0) {
                        await player.say("Who's Zanaris?");
                        await npc.say("Hehe Zanaris isn't a person");
                        await npc.say("It's a magical hidden city");
                    } else {
                        await player.say("What makes you think it's out here?");
                        await npc.say("Don't you know the legends?");
                        await npc.say("Of the magical city, hidden in the swamp");
                    }
                    await zanarismenu(player, npc);
                } else if (subOption === 1) {
                    await player.say("What's Zanaris?");
                    await npc.say("I don't think we want other people competing with us to find it");
                }
            } else if (option === 1) {
                await player.say('Do you know any good adventures I can go on?');
                await npc.say("Well we're on an adventure now");
                await npc.say("Mind you this is our adventure");
                await npc.say("We don't want to share it - find your own");

                const insist = await player.ask([
                    'Please tell me',
                    "I don't think you've found a good adventure at all"
                ], true);

                if (insist === 1) {
                    await npc.say("We're on one of the greatest adventures I'll have you know");
                    await npc.say("Searching for Zanaris isn't a walk in the park");
                    await zanarismenu(player, npc);
                }
            }
        } else if (stage === 1) {
            await player.say('So let me get this straight');
            await player.say('I need to search the trees near here for a leprechaun?');
            await player.say('And he will tell me where Zanaris is?');
            await npc.say('That is what the legends and rumours are, yes');
        } else if (stage >= 2 || stage === -1) {
            await player.say('Thank you for your information');
            await player.say('It has helped me a lot in my quest to find Zanaris');
            await npc.say('So what have you found out?');
            await npc.say('Where is Zanaris?');
            await player.say('I think I will keep that to myself');
        }
        return true;
    }

    // Leprechaun
    if (npc.id === NPC_LEPRECHAUN) {
        await npc.say('Ay you big elephant');
        await npc.say('You have caught me');
        await npc.say('What would you be wanting with old Shamus then?');

        if (stage === 0) {
            await player.say("I'm not sure");
            await npc.say("Well you'll have to catch me again when you are");
            player.message('The leprechaun magically disappears');
            // Remove NPC
            return true;
        } else if (stage === 1) {
            await player.say('I want to find Zanaris');
            await npc.say('Zanaris?');
            await npc.say('You need to go in the funny little shed');
            await npc.say('in the middle of the swamp');
            await player.say('Oh I thought Zanaris was a city');
            await npc.say('It is');

            const menu = await player.ask([
                'How does it fit in a shed then?',
                "I've been in that shed, I didn't see a city"
            ], true);

            if (menu === 0) {
                await player.say('How does it fit in a shed then?');
                await npc.say('Silly person');
                await npc.say("The city isn't in the shed");
                await npc.say('The shed is a portal to Zanaris');
                await player.say('So I just walk into the shed and end up in Zanaris?');
            } else {
                await player.say("I've been in that shed");
                await player.say("I didn't see a city");
            }

            await npc.say("Oh didn't I say?");
            await npc.say('You need to be carrying a Dramenwood staff');
            await npc.say('Otherwise you do just end up in a shed');
            await player.say('So where would I get a staff?');
            await npc.say('Dramenwood staffs are crafted from branches');
            await npc.say('These staffs are cut from the Dramen tree');
            await npc.say('located somewhere in a cave on the island of Entrana');
            await npc.say('I believe the monks of Entrana have recently');
            await npc.say('Started running a ship from Port Sarim to Entrana');

            setQuestStage(player, 2);
            player.message('The leprechaun magically disappears');
            return true;
        } else {
            const menu = await player.ask([
                "I'm not sure",
                'How do I get to Zanaris again?'
            ], true);

            if (menu === 0) {
                await npc.say("I dunno, what stupid people");
                await npc.say("Who go to all the trouble to catch leprechaun's");
                await npc.say("When they don't even know what they want");
            } else {
                await npc.say('You need to enter the shed in the middle of the swamp');
                await npc.say('While holding a dramenwood staff');
                await npc.say('Made from a branch');
                await npc.say('Cut from the dramen tree on the island of Entrana');
            }
            player.message('The leprechaun magically disappears');
            return true;
        }
    }

    return false;
}

async function zanarismenu(player, npc) {
    const option = await player.ask([
        "If it's hidden how are you planning to find it?",
        "There's no such thing"
    ], true);

    if (option === 0) {
        await npc.say("Well we don't want to tell others that");
        await npc.say('We want all the glory of finding it for ourselves');

        const afterOption = await player.ask([
            'Please tell me',
            "Looks like you don't know either if you're sitting around here"
        ], true);

        if (afterOption === 1) {
            await player.say("Looks like you don't know either if you're sitting around here");
            await npc.say('Of course we know');
            await npc.say("We haven't worked out which tree the stupid leprechaun is in yet");
            await npc.say('Oops I didn\'t mean to tell you that');
            await player.say('So a Leprechaun knows where Zanaris is?');
            await npc.say('Eerm');
            await npc.say('yes');
            await player.say("And he's in a tree somewhere around here");
            await player.say('Thank you very much');
            setQuestStage(player, 1);
        }
    } else {
        await npc.say('Well when we find which tree the leprechaun is in');
        await npc.say('You can eat those words');
        await npc.say("Oops I didn't mean to tell you that");
        await player.say('So a Leprechaun knows where Zanaris is?');
        await npc.say('Eerm');
        await npc.say('yes');
        await player.say("And he's in a tree somewhere around here");
        await player.say('Thank you very much');
        setQuestStage(player, 1);
    }
}

// Object interaction handler
function onOperateObject(player, object) {
    const stage = getQuestStage(player);

    // Dramen Tree
    if (object.id === OBJ_DRAMEN_TREE) {
        if (stage >= 2 || stage === -1) {
            if (player.skills[8] < 36) { // Woodcutting
                player.message('You need level 36 woodcutting to chop this tree');
                return true;
            }

            if (stage === -1 || stage === 4) {
                // Player can cut branch
                player.message('You cut a branch from the Dramen tree');
                player.inventory.add(ITEM_DRAMEN_BRANCH, 1);
            } else if (stage === 2 || stage === 3) {
                // Tree Spirit attacks
                if (stage === 2) {
                    setQuestStage(player, 3);
                }
                player.message('A tree spirit appears!');
                // Spawn Tree Spirit NPC (combat would need to be implemented)
            }
        } else {
            player.message('The tree seems to have an ominous aura');
            player.message('You do not feel like chopping it down');
        }
        return true;
    }

    // Leprechaun Tree
    if (object.id === OBJ_LEPRECHAUN_TREE) {
        if (stage >= 1 && stage <= 3) {
            player.message('A Leprechaun jumps down from the tree and runs off');
            // Spawn leprechaun NPC at nearby location
        } else {
            player.message('There is nothing in this tree');
        }
        return true;
    }

    return false;
}

// Door handler for Zanaris entrance
function onOperateBoundary(player, object) {
    if (object.id === DOOR_ZANARIS) {
        const stage = getQuestStage(player);

        // Check if player has Dramen Staff equipped
        const hasStaff = player.inventory.has(ITEM_DRAMEN_STAFF) ||
            (player.equipment && player.equipment.hasEquipped(ITEM_DRAMEN_STAFF));

        if (hasStaff && (stage === 4 || stage === -1)) {
            player.message('The world starts to shimmer');
            player.message('You find yourself in different surroundings');

            if (stage === 4) {
                // Complete quest
                setQuestStage(player, -1);
                player.questPoints += QUEST_POINTS;
                player.message('Congratulations! You have completed the Lost City quest!');
                player.message('You gain 3 Quest Points');
            }

            // Teleport to Zanaris (fairy ring area)
            player.teleport(126, 3518, true);
        } else {
            player.message('You go through the door and find yourself in a shed');
        }
        return true;
    }
    return false;
}

// Item use handler (knife + Dramen branch = Dramen staff)
function onUseItem(player, item1, item2) {
    if ((item1.id === ITEM_KNIFE && item2.id === ITEM_DRAMEN_BRANCH) ||
        (item1.id === ITEM_DRAMEN_BRANCH && item2.id === ITEM_KNIFE)) {

        if (player.skills[12] < 31) { // Crafting
            player.message('You need level 31 crafting to make this staff');
            return true;
        }

        player.inventory.remove(ITEM_DRAMEN_BRANCH, 1);
        player.inventory.add(ITEM_DRAMEN_STAFF, 1);
        player.message('You carve the branch into a staff');
        return true;
    }
    return false;
}

// Kill NPC handler (Tree Spirit)
function onKillNpc(player, npc) {
    if (npc.id === NPC_TREE_SPIRIT) {
        const stage = getQuestStage(player);
        if (stage === 3) {
            setQuestStage(player, 4);
            player.message('You have defeated the Tree Spirit!');
        }
        return true;
    }
    return false;
}

module.exports = {
    name: 'lost-city',
    questName: QUEST_NAME,
    questPoints: QUEST_POINTS,
    onTalkToNpc,
    onOperateObject,
    onOperateBoundary,
    onUseItem,
    onKillNpc,
    // NPC IDs this quest handles
    npcs: [NPC_LEPRECHAUN, NPC_TREE_SPIRIT, ...ADVENTURER_NPCS],
    // Object IDs this quest handles
    objects: [OBJ_LEPRECHAUN_TREE, OBJ_DRAMEN_TREE],
    // Boundary IDs this quest handles
    boundaries: [DOOR_ZANARIS]
};
