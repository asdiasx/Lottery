import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const dbDir = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(dbDir, 'lottery.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS lotomania (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      draw_number INTEGER UNIQUE NOT NULL,
      draw_date TEXT NOT NULL,
      number_of_groups INTEGER NOT NULL,
      drawing_tens TEXT NOT NULL
    )
  `);
}

async function selectDraws(quantity) {
  const db = getDb();
  const limitClause = quantity ? `LIMIT ${parseInt(quantity, 10)}` : '';
  const stmt = db.prepare(`
    SELECT
    id,
    draw_number,
    draw_date,
    number_of_groups,
    drawing_tens
    FROM lotomania ORDER BY draw_number DESC ${limitClause}
  `);
  const rows = stmt.all();
  return rows;
}

async function insertDraw(draw) {
  const db = getDb();
  const stmt = db.prepare(
    'INSERT OR IGNORE INTO lotomania(draw_number, draw_date, number_of_groups, drawing_tens) VALUES (?, ?, ?, ?)'
  );
  return stmt.run(
    draw.drawNumber,
    draw.drawDate,
    draw.numberOfGroups,
    draw.drawingTens
  );
}

async function selectDbLastDraw() {
  const db = getDb();
  const stmt = db.prepare(
    'SELECT draw_number FROM lotomania ORDER BY draw_number DESC LIMIT 1'
  );
  const result = stmt.get();
  return result?.draw_number || 2205;
}

export { selectDraws, insertDraw, selectDbLastDraw };
