export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, code: 3 }), { status: 400 });
        }

        const playerJson = await env.KV.get(username.toLowerCase());

        console.log(`[API DEBUG] Login attempt for '${username}' (len=${username.length})`);

        if (!playerJson) {
            console.log(`[API DEBUG] User not found in KV`);
            return new Response(JSON.stringify({ success: false, code: 3 }), { status: 200 });
        }

        const player = JSON.parse(playerJson);

        console.log(`[API DEBUG] Found user '${player.username}'`);
        console.log(`[API DEBUG] Stored pass: '${player.password}' (len=${player.password.length})`);
        console.log(`[API DEBUG] Sent pass:   '${password}' (len=${password.length})`);
        console.log(`[API DEBUG] Match? ${player.password === password}`);

        if (player.password !== password) {
            return new Response(JSON.stringify({ success: false, code: 3 }), { status: 200 });
        }

        // Force sound on for everyone (just in case)
        player.soundOn = 1;

        // Force members status (for existing accounts created before members was enabled)
        player.members = true;

        return new Response(JSON.stringify({ success: true, player }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
