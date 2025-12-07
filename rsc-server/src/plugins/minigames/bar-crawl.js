/**
 * Bar Crawl Minigame
 * 
 * Visit all bars in RuneScape and drink a special drink at each.
 * Required for Barbarian Agility and later Fremennik quests.
 * 
 * Bars to visit:
 * 1. Blue Moon Inn (Varrock)
 * 2. Jolly Boar Inn (Varrock)
 * 3. Rising Sun (Falador)
 * 4. Rusty Anchor (Port Sarim)
 * 5. Karamja Spirits (Musa Point)
 * 6. Dead Man's Chest (Brimhaven)
 * 7. Flying Horse Inn (Ardougne)
 * 8. Foresters Arms (Seers Village)
 * 
 * Reward: Bar Crawl Card (access to Barbarian Outpost)
 */

const MINIGAME_NAME = 'Bar Crawl';

// Bar locations and their signature drinks
const BARS = {
    blueMoon: { id: 1, name: 'Blue Moon Inn', drink: 'Uncle Humphreys Gutrot', bartender: 151 },
    jollyBoar: { id: 2, name: 'Jolly Boar Inn', drink: 'Olde Suspiciouse', bartender: 152 },
    risingSun: { id: 3, name: 'Rising Sun', drink: 'Hand of Death Cocktail', bartender: 153 },
    rustyAnchor: { id: 4, name: 'Rusty Anchor', drink: 'Black Skull Ale', bartender: 154 },
    karamja: { id: 5, name: 'Karamja Spirits', drink: 'Ape Bite Liqueur', bartender: 155 },
    deadMans: { id: 6, name: "Dead Man's Chest", drink: 'Supergrog', bartender: 156 },
    flyingHorse: { id: 7, name: 'Flying Horse Inn', drink: 'Heart Stopper', bartender: 157 },
    foresters: { id: 8, name: 'Foresters Arms', drink: "Liverbane Ale", bartender: 158 }
};

// Item IDs
const ITEM_BARCRAWL_CARD = 700;

function getBarCrawlProgress(player) {
    return player.cache.barCrawl || {
        started: false,
        barsVisited: [],
        complete: false
    };
}

function setBarCrawlProgress(player, progress) {
    player.cache.barCrawl = progress;
}

// Start bar crawl from Barbarian Guard
async function onTalkToBarbarianGuard(player, npc) {
    const progress = getBarCrawlProgress(player);

    if (progress.complete) {
        await npc.say("You've completed the bar crawl");
        await npc.say("You may enter the Barbarian Outpost");
        return true;
    }

    if (!progress.started) {
        await npc.say("Halt! Only warriors may enter the Barbarian Outpost");
        await npc.say("You must prove yourself by completing the Bar Crawl");

        const option = await player.ask([
            "What's the Bar Crawl?",
            "I'll do it!"
        ], true);

        if (option === 0) {
            await npc.say("You must visit every bar in the land");
            await npc.say("And drink their signature drink");
            await npc.say("You'll need a strong stomach!");
        } else {
            await npc.say("Here is your Bar Crawl card");
            await npc.say("Get it signed at each bar after drinking their special");

            progress.started = true;
            progress.barsVisited = [];
            setBarCrawlProgress(player, progress);
            player.inventory.add(ITEM_BARCRAWL_CARD, 1);
            player.message("You receive a Bar Crawl card");
        }
    } else {
        const remaining = 8 - progress.barsVisited.length;
        await npc.say("You still have bars to visit!");
        await npc.say(`Bars remaining: ${remaining}`);
    }
    return true;
}

// Talk to bartender for signature drink
async function onTalkToBartender(player, npc, barId) {
    const progress = getBarCrawlProgress(player);

    if (!progress.started) {
        return false; // Normal bartender dialogue
    }

    if (progress.barsVisited.includes(barId)) {
        await npc.say("You've already had your drink here!");
        return true;
    }

    const bar = Object.values(BARS).find(b => b.id === barId);
    if (!bar) return false;

    await npc.say(`Would you like to try our ${bar.drink}?`);
    await npc.say("It's quite strong...");

    const option = await player.ask([
        "Yes please!",
        "No thanks"
    ], true);

    if (option === 0) {
        await npc.say("Here you go!");
        player.message(`You drink the ${bar.drink}`);
        player.message("Bleurgh! That was rough...");

        // Apply drunk effects
        player.message("You feel quite drunk");

        // Mark bar as visited
        progress.barsVisited.push(barId);
        setBarCrawlProgress(player, progress);

        player.message(`The bartender signs your card (${progress.barsVisited.length}/8)`);

        // Check if complete
        if (progress.barsVisited.length >= 8) {
            progress.complete = true;
            setBarCrawlProgress(player, progress);
            player.message("You have completed the Bar Crawl!");
            player.message("Return to the Barbarian Guard");
        }
    }
    return true;
}

// Command to check progress
function handleBarCrawlCommand(player, args) {
    const progress = getBarCrawlProgress(player);

    if (!progress.started) {
        player.message("You haven't started the Bar Crawl");
        player.message("Talk to the Barbarian Guard near Baxtorian Falls");
        return true;
    }

    if (progress.complete) {
        player.message("Bar Crawl: COMPLETE!");
        return true;
    }

    player.message(`=== Bar Crawl Progress: ${progress.barsVisited.length}/8 ===`);

    for (const [key, bar] of Object.entries(BARS)) {
        const visited = progress.barsVisited.includes(bar.id);
        const status = visited ? '✓' : '○';
        player.message(`${status} ${bar.name}`);
    }

    return true;
}

module.exports = {
    MINIGAME_NAME,
    BARS,
    getBarCrawlProgress,
    setBarCrawlProgress,
    onTalkToBarbarianGuard,
    onTalkToBartender,
    handleBarCrawlCommand
};
