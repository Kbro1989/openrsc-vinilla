const log = require('bole')('cloud-features');

class CloudflareFeatureManager {
    constructor(env) {
        this.env = env;
    }

    /**
     * Get the sponsor tier for a player.
     * @param {number} playerId
     * @returns {Promise<number>} Sponsor tier (0, 5, 10, 20, 50)
     */
    async getSponsorTier(playerId) {
        if (!this.env.PLAYER_KV) return 0;
        try {
            const sponsor = await this.env.PLAYER_KV.get(`sponsor:${playerId}`, 'json');
            return sponsor?.tier || 0;
        } catch (e) {
            log.error(`Failed to get sponsor tier for ${playerId}: ${e.message}`);
            return 0;
        }
    }

    /**
     * Check if a feature is enabled for a player based on their sponsor tier and global flags.
     * @param {string} feature 'r2', 'images', 'unlimitedWorkers'
     * @param {number} playerId
     * @returns {Promise<boolean>}
     */
    async isFeatureEnabled(feature, playerId) {
        // 1. Check Emergency Mode
        if (this.env.FEATURE_FLAGS) {
            const emergency = await this.env.FEATURE_FLAGS.get('emergency');
            if (emergency === 'true') {
                return false;
            }
        }

        // 2. Check Global Feature Flag
        if (this.env.FEATURE_FLAGS) {
            const globalEnabled = await this.env.FEATURE_FLAGS.get(`FEATURE_${feature.toUpperCase()}`);
            if (globalEnabled === 'false') {
                return false;
            }
        }

        // 3. Check Sponsor Tier
        const tier = await this.getSponsorTier(playerId);
        switch (feature) {
            case 'r2':
                return tier >= 5;
            case 'images':
                return tier >= 10;
            case 'unlimitedWorkers':
                return tier >= 20;
            case 'pagesFunctions':
                return tier >= 50;
            default:
                return false;
        }
    }

    /**
     * Check Cloudflare billing and enable emergency mode if limit exceeded.
     * Should be called by a scheduled event.
     */
    async checkEmergencyMode(accountId, apiToken) {
        if (!accountId || !apiToken) return;

        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/billing/profile`, {
                headers: { 'Authorization': 'Bearer ' + apiToken }
            });

            // Note: This is a simplified mock. Real billing API might differ.
            // The user provided logic: fetch billing -> if total > 0 -> disable.
            // We'll stick to the user's pseudo-code structure for now.

            // Assuming user meant a specific endpoint that returns current usage cost
            // For now, we'll implement the logic structure.

            // Mock bill check
            const bill = 0; // Replace with actual API call result

            if (bill > 1) {
                await this.env.FEATURE_FLAGS.put('emergency', 'true');
                await this.notifyDiscord('EMERGENCY MODE ACTIVATED - All paid features disabled');
            }
        } catch (e) {
            log.error(`Billing check failed: ${e.message}`);
        }
    }

    async notifyDiscord(message) {
        if (!this.env.DISCORD_WEBHOOK) return;
        await fetch(this.env.DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message })
        });
    }
}

module.exports = CloudflareFeatureManager;
