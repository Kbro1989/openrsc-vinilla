export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const username = url.searchParams.get("username");

        if (!username) {
            return new Response("Missing username", { status: 400 });
        }

        const data = await env.KV.get(username.toLowerCase());

        if (!data) {
            return new Response("User not found", { status: 404 });
        }

        return new Response(data, {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}
