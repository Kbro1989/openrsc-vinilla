-- Migration number: 0001 	 2024-11-28T18:00:00.000Z
CREATE TABLE IF NOT EXISTS players (
    username TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
