-- RSC Leaderboard Schema for Cloudflare D1
-- Run with: wrangler d1 execute ai-architect-db --file schema.sql

CREATE TABLE IF NOT EXISTS highscores (
    username TEXT PRIMARY KEY,
    total_level INTEGER,
    total_xp INTEGER,
    combat_level INTEGER,
    updated_at INTEGER,
    metadata TEXT -- JSON string for individual skills
);

CREATE INDEX IF NOT EXISTS idx_total_level ON highscores(total_level DESC);
CREATE INDEX IF NOT EXISTS idx_total_xp ON highscores(total_xp DESC);

-- Analytics table for tracking game economy/stats without costing $.
CREATE TABLE IF NOT EXISTS game_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    data TEXT,
    timestamp INTEGER
);
