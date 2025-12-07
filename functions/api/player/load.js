export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const username = url.searchParams.get("username");

        if (!username) {
            return new Response(JSON.stringify({ success: false, error: "Username required" }), { status: 400 });
        }

        // Direct KV Access (No Durable Object)
        const playerJson = await env.KV.get(username.toLowerCase());

        if (!playerJson) {
            return new Response(JSON.stringify({ success: false, error: "Player not found" }), { status: 404 });
        }

        return new Response(playerJson, { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
