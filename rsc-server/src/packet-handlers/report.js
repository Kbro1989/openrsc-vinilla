const REPORT_COOLDOWN = 60000; // 60 seconds

async function reportAbuse({ player }, { username, reason, mute }) {
    username = username.toLowerCase();

    if (username === player.username) {
        player.message("You can't report yourself!!");
        return;
    }

    if (!username) {
        player.message("You must enter a name to report.");
        return;
    }

    // Check cooldown
    if (player.lastReport && Date.now() - player.lastReport < REPORT_COOLDOWN) {
        player.message("You already sent an abuse report under 60 secs ago! Do not abuse this system!");
        return;
    }

    const { world } = player;
    const reportedPlayer = world.players.find(p => p.username === username);

    // In a real system we might check a database if they are offline, 
    // but for now we check online players or just accept the report if valid format.
    // OpenRSC checks database. We'll check online first, then assume valid if not found 
    // (or we could reject, but better to log it for review).
    // Actually OpenRSC rejects if "Invalid player name" (not in DB).
    // We don't have easy DB access here yet, so we'll check online players.

    if (!reportedPlayer) {
        // If not online, we might still want to allow it if we had DB access.
        // For this "dinosaur" restoration, let's assume if they aren't online we can't verify them easily yet.
        player.message("Invalid player name or player is not online.");
        return;
    }

    // Update last report time
    player.lastReport = Date.now();

    player.message("Thank-you, your abuse report has been received.");

    const reasons = {
        1: "Offensive language",
        2: "Item scamming",
        3: "Password scamming",
        4: "Bug abuse",
        5: "Jagex staff impersonation",
        6: "Account sharing/trading",
        7: "Macroing",
        8: "Multiple logging in",
        9: "Encouraging others to break rules",
        10: "Misuse of customer support",
        11: "Advertising / website",
        12: "Real world item trading"
    };

    const reasonText = reasons[reason] || "Unknown Reason";

    console.log(`[REPORT] ${player.username} reported ${username} for: ${reasonText} (Mute suggested: ${mute})`);

    // If we had a database/discord hook, we would send it there.
    // world.server.logReport(...) 

    if (mute && player.rank >= 2) { // Mod/Admin
        // Auto-mute logic would go here
        player.message(`[MOD] You have suggested a mute for ${username}.`);
        if (reportedPlayer) {
            reportedPlayer.message("@red@You have been reported by a moderator.");
        }
    }
}

module.exports = { reportAbuse };
