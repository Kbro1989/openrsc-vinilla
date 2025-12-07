/**
 * Durable Object Worker Entry Point
 * 
 * This is the main entry point for the Durable Object Worker.
 * It exports the RSCServerDO class and provides a default fetch handler.
 */

import { RSCServerDO } from './RSCServerDO.js';
import { PlayerDO } from './PlayerDO.js';

// Export the Durable Object classes
export { RSCServerDO, PlayerDO };

// Default fetch handler for the Worker (not the Durable Object)
// This is called when the Worker itself receives a request
export default {
    async fetch(request, env, ctx) {
        // We use a fixed name to ensure all players connect to the same World instance (Shard)
        const id = env.RSC_SERVER.idFromName('default-world');
        const stub = env.RSC_SERVER.get(id);

        return stub.fetch(request);
    }
};
