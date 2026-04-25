/**
 * Sovereign Shard Entry Point
 * 
 * Dedicated entry for wrangler-server.toml.
 * Re-exports the Durable Object class under the name Wrangler expects.
 */

import { RSCServerDO } from './durable-objects/RSCServerDO.js';

// Wrangler config expects class_name = "GameWorld"
export { RSCServerDO as GameWorld };

export default {
    async fetch(request, env) {
        const id = env.GAME_WORLD.idFromName('sovereign-world-alpha');
        const stub = env.GAME_WORLD.get(id);
        return stub.fetch(request);
    }
};
