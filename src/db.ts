export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface D1PreparedStatement {
  bind(...params: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

export interface AnalysisRecord {
  id: number;
  sentence: string;
  sentence_hash: string;
  result: string;
  created_at: string;
}

async function hashSentence(sentence: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sentence.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function findCachedResult(
  db: D1Database,
  sentence: string
): Promise<string | null> {
  const hash = await hashSentence(sentence);
  const row = await db.prepare(
    'SELECT result FROM analyses WHERE sentence_hash = ?'
  ).bind(hash).first<{ result: string }>();

  return row?.result ?? null;
}

export async function saveAnalysis(
  db: D1Database,
  sentence: string,
  result: string
): Promise<void> {
  const hash = await hashSentence(sentence);
  try {
    await db.prepare(
      'INSERT OR IGNORE INTO analyses (sentence, sentence_hash, result) VALUES (?, ?, ?)'
    ).bind(sentence, hash, result).run();
  } catch {
    // ignore duplicate insert
  }
}

export async function getHistory(
  db: D1Database,
  limit = 50,
  offset = 0
): Promise<AnalysisRecord[]> {
  const { results } = await db.prepare(
    'SELECT id, sentence, sentence_hash, result, created_at FROM analyses ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all<AnalysisRecord>();

  return results || [];
}

export async function deleteAnalysis(
  db: D1Database,
  id: number
): Promise<boolean> {
  const result = await db.prepare('DELETE FROM analyses WHERE id = ?').bind(id).run();
  return result.meta?.changes !== 0;
}

export async function getSetting(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value ?? null;
}

export async function setSetting(db: D1Database, key: string, value: string): Promise<void> {
  await db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(key, value).run();
}

export async function deleteSetting(db: D1Database, key: string): Promise<void> {
  await db.prepare('DELETE FROM settings WHERE key = ?').bind(key).run();
}

export async function getAllSettings(db: D1Database): Promise<Record<string, string>> {
  const { results } = await db.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>();
  const map: Record<string, string> = {};
  for (const row of results || []) {
    map[row.key] = row.value;
  }
  return map;
}
