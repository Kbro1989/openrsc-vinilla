-- Migration number: 0000 	 2024-11-28T17:00:00.000Z
DROP TABLE IF EXISTS game_stats;
CREATE TABLE IF NOT EXISTS game_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    data TEXT,
    timestamp INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_game_stats_timestamp ON game_stats(timestamp);
