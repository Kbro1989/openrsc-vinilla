export type Position = {
    x: number;
    y: number;
    plane: number;
    id: string;
};

export type OutgoingMessage =
    | {
        type: "add-marker";
        position: Position;
    }
    | {
        type: "remove-marker";
        id: string;
    }
    | {
        type: "update-position";
        position: Position;
    };

export type IncomingMessage = {
    type: "update-position";
    position: Omit<Position, "id">;
};
