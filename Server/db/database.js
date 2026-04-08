const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'orders.db');

let db = null;

async function initDb() {
  const SQL = await initSqlJs();

  db = fs.existsSync(DB_PATH)
    ? new SQL.Database(fs.readFileSync(DB_PATH))
    : new SQL.Database();

  createOrdersTable();
  saveDb();

  return db;
}

function createOrdersTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL DEFAULT '',
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'Preparing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = db.exec('PRAGMA table_info(orders)');
  const hasUserNameColumn = columns.length > 0 && columns[0].values.some(column => column[1] === 'user_name');

  if (!hasUserNameColumn) {
    db.run("ALTER TABLE orders ADD COLUMN user_name TEXT NOT NULL DEFAULT ''");
  }
}

function saveDb() {
  if (!db) {
    throw new Error('Database is not initialized');
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  return db;
}

module.exports = { initDb, getDb, saveDb };
