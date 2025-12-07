/**
 * Cloudflare Pages Function - Game Health Check
 * Returns the health status of both F ly.io and Cloudflare servers
 */

export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Try to check Fly.io health
        let flyioStatus = 'unknown';
        let flyioPlayers = 0;
        let flyioVersion = 'Unknown';

        try {
            const flyResponse = await fetch('https://rsc-game-server.fly.dev/health', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(3000)
            });

            if (flyResponse.ok) {
                const flyData = await flyResponse.json();
                flyioStatus = 'healthy';
                flyioPlayers = flyData.players || 0;
                flyioVersion = flyData.version || 'Unknown';
            } else {
                flyioStatus = 'unhealthy';
            }
        } catch (error) {
            console.error('[Health] Fly.io check failed:', error.message);
            flyioStatus = 'down';
        }

        // Cloudflare is always available
        const cloudflareStatus = 'healthy';
        const cloudflarePlayers = 0; // TODO: get from DO

        return new Response(JSON.stringify({
            timestamp: new Date().toISOString(),
            servers: {
                flyio: {
                    status: flyioStatus,
                    players: flyioPlayers,
                    version: flyioVersion,
                    priority: 1
                },
                cloudflare: {
                    status: cloudflareStatus,
                    players: cloudflarePlayers,
                    version: '1.0.0', // TODO: sync with package.json
                    priority: 2,
                    readOnly: true
                }
            },
            recommended: flyioStatus === 'healthy' ? 'flyio' : 'cloudflare'
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=5' // Cache for 5 seconds
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Health check failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
