export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const username = url.searchParams.get("username");

        if (!username) {
            return new Response(JSON.stringify({ success: false, error: "Username required" }), { status: 400 });
        }

        // Direct KV Access (No Durable Object)
        const key = `player:${username.toLowerCase()}`;
        const playerJson = await env.KV.get(key);
        console.log(`[API] Loading player ${username} from key ${key}: ${playerJson ? 'Found' : 'Not Found'}`);

        if (!playerJson) {
            // Debug: List keys to see if we can find it
            const list = await env.KV.list({ prefix: 'player:' });
            console.log('[API] Debug: Current keys in KV:', list.keys.map(k => k.name));
            return new Response(JSON.stringify({ success: false, error: "Player not found" }), { status: 404 });
        }

        return new Response(playerJson, { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
