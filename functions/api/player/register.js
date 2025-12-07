export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const player = await request.json();
        const username = player.username.toLowerCase();

        if (!username || !player.password) {
            return new Response(JSON.stringify({ success: false, error: "Invalid data" }), { status: 400 });
        }

        // Check if player already exists
        const existing = await env.KV.get(username);
        if (existing) {
            return new Response(JSON.stringify({ success: false, error: "Username taken" }), { status: 409 });
        }

        // Ensure sound is saved as enabled
        player.soundOn = 1;
        // Force members status for all new accounts
        player.members = true;
        // Grant admin rank (3 = administrator) for private server
        player.rank = 3;
        // Ensure loginDate is 0/null for new players so they get the appearance screen
        player.loginDate = 0;

        await env.KV.put(username, JSON.stringify(player));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
