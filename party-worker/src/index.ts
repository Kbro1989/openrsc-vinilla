import { routePartykitRequest, Server, Connection, ConnectionContext } from "partyserver";
import { IncomingMessage, OutgoingMessage, Position } from "./shared";

type ConnectionState = {
    position?: Position;
};

export class RSCServer extends Server {
    onConnect(conn: Connection<ConnectionState>, ctx: ConnectionContext) {
        console.log(`Connected: ${conn.id}`);

        // Send existing players to new connection
        for (const otherConn of this.getConnections<ConnectionState>()) {
            if (otherConn.id !== conn.id && otherConn.state?.position) {
                conn.send(JSON.stringify({
                    type: "add-marker",
                    position: otherConn.state.position
                } satisfies OutgoingMessage));
            }
        }
    }

    onMessage(conn: Connection<ConnectionState>, message: string) {
        try {
            const data = JSON.parse(message) as IncomingMessage;

            if (data.type === "update-position") {
                const position: Position = {
                    ...data.position,
                    id: conn.id
                };

                // Update state
                conn.setState({ position });

                // Broadcast to others
                this.broadcast(JSON.stringify({
                    type: "update-position",
                    position
                } satisfies OutgoingMessage), [conn.id]);
            }
        } catch (e) {
            console.error("Error parsing message", e);
        }
    }

    onClose(conn: Connection<ConnectionState>) {
        console.log(`Disconnected: ${conn.id}`);
        this.broadcast(JSON.stringify({
            type: "remove-marker",
            id: conn.id
        } satisfies OutgoingMessage));
    }
}

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
        console.log("Request URL:", request.url);
        console.log("Env keys:", Object.keys(env));

        // Map 'main' party to RSC_PARTY binding
        const partyEnv = { ...env, main: env.RSC_PARTY };
        console.log("PartyEnv keys:", Object.keys(partyEnv));

        return (
            (await routePartykitRequest(request, partyEnv)) ||
            new Response("Not Found", { status: 404 })
        );
    },
};
