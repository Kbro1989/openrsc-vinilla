export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        console.log("Restore Endpoint Hit");
        const data = await request.json();

        if (data.username && env.KV) {
            console.log("Restoring user:", data.username);
            await env.KV.put(data.username.toLowerCase(), JSON.stringify(data));
            return new Response(`Restored data for ${data.username}`, { status: 200 });
        } else {
            return new Response("Missing username or KV binding", { status: 400 });
        }
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}
