const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'orders.db');
const SQL_WASM_DIR = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist');

let db = null;

async function initDb() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => path.join(SQL_WASM_DIR, file)
    });

    if (!fs.existsSync(__dirname)) {
      fs.mkdirSync(__dirname, { recursive: true });
    }

    // Load existing database or create a new one when the file doesn't exist yet.
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'Preparing',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    saveDb();
    return db;
  } catch (error) {
    throw new Error(`Unable to initialize database: ${error.message}`);
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
