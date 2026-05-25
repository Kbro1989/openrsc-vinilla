
async function clearKV() {
    const list = await env.KV.list({ prefix: 'player:' });
    for (const key of list.keys) {
        await env.KV.delete(key.name);
        console.log(`Deleted: ${key.name}`);
    }
}
