export async function onRequestGet(context) {
    try {
        const { env } = context;
        
        // write a key-value pair
        await env.KV.put('KEY', 'VALUE');

        // read a key-value pair
        const value = await env.KV.get('KEY');

        // list all key-value pairs
        const allKeys = await env.KV.list();

        // delete a key-value pair
        await env.KV.delete('KEY');

        // return a Workers response
        return new Response(
            JSON.stringify({
                value: value,
                allKeys: allKeys,
            }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (e) {
        return new Response(
            JSON.stringify({ success: false, error: e.message }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
