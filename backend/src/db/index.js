const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, "privacy_checker.sqlite");
const MAX_HISTORY = 50;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS checks (
    id TEXT PRIMARY KEY,
    site_name TEXT NOT NULL,
    overall_score REAL NOT NULL,
    risk_level TEXT NOT NULL,
    input_json TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_checks_created_at ON checks (created_at DESC);
`);

function rowToEntry(row) {
  return {
    id: row.id,
    siteName: row.site_name,
    input: JSON.parse(row.input_json),
    result: JSON.parse(row.result_json),
    createdAt: row.created_at,
  };
}

const insertStmt = db.prepare(`
  INSERT INTO checks (id, site_name, overall_score, risk_level, input_json, result_json, created_at)
  VALUES (@id, @siteName, @overallScore, @riskLevel, @inputJson, @resultJson, @createdAt)
  ON CONFLICT(id) DO UPDATE SET
    site_name = excluded.site_name,
    overall_score = excluded.overall_score,
    risk_level = excluded.risk_level,
    input_json = excluded.input_json,
    result_json = excluded.result_json,
    created_at = excluded.created_at
`);

const trimStmt = db.prepare(`
  DELETE FROM checks
  WHERE id NOT IN (
    SELECT id FROM checks ORDER BY created_at DESC LIMIT ?
  )
`);

function saveCheck(entry) {
  insertStmt.run({
    id: entry.id,
    siteName: entry.siteName,
    overallScore: entry.result.overallScore,
    riskLevel: entry.result.riskLevel,
    inputJson: JSON.stringify(entry.input),
    resultJson: JSON.stringify(entry.result),
    createdAt: entry.createdAt,
  });
  trimStmt.run(MAX_HISTORY);
}

function readHistory() {
  const rows = db.prepare(`SELECT * FROM checks ORDER BY created_at DESC LIMIT ?`).all(MAX_HISTORY);
  return rows.map(rowToEntry);
}

function getById(id) {
  const row = db.prepare(`SELECT * FROM checks WHERE id = ?`).get(id);
  return row ? rowToEntry(row) : null;
}

// Handy for a future "why it matters" style stat block, e.g. average
// score across everything that's actually been checked through this app.
function getStats() {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS total, AVG(overall_score) AS avgScore,
              SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) AS highRiskCount
       FROM checks`
    )
    .get();
  return {
    total: row.total,
    avgScore: row.avgScore !== null ? Math.round(row.avgScore * 10) / 10 : null,
    highRiskCount: row.highRiskCount,
  };
}

module.exports = { db, saveCheck, readHistory, getById, getStats, MAX_HISTORY };
