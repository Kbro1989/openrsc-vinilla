export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const player = await request.json();
        const username = player.username.toLowerCase();

        // Ensure sound is saved as enabled (Legacy compat)
        player.soundOn = 1;

        // Direct KV Write (No Durable Object)
        console.log(`[API] Saving player ${username}...`);
        await env.KV.put(username, JSON.stringify(player));
        console.log(`[API] Saved player ${username} successfully.`);

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
