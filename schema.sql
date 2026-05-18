CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sentence TEXT NOT NULL,
  sentence_hash TEXT NOT NULL UNIQUE,
  result TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analyses_hash ON analyses(sentence_hash);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
