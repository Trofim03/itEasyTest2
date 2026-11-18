import Database from 'better-sqlite3';

const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keitaro_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    geo TEXT NOT NULL,
    offer_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export const insertCampaign = db.prepare(`
  INSERT INTO campaigns (keitaro_id, name, geo, offer_id)
  VALUES (?, ?, ?, ?)
`);

export const listCampaignLog = db.prepare(`
  SELECT * FROM campaigns ORDER BY id DESC
`);

export default db;