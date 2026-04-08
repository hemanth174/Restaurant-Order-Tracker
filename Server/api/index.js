const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');

const app = express();

// In-memory database (resets on cold start - Vercel limitation)
let db = null;

async function initDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  db = new SQL.Database();
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
  return db;
}

// Middleware
app.use(cors());
app.use(express.json());

const STATUS_FLOW = ['Preparing', 'Ready', 'Completed'];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    await initDb();
    const result = db.exec('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = result.length > 0 ? result[0].values.map(row => ({
      id: row[0],
      item_name: row[1],
      quantity: row[2],
      status: row[3],
      created_at: row[4],
      updated_at: row[5]
    })) : [];
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Fetching Error please Try Again' });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    await initDb();
    const { item_name, quantity = 1 } = req.body;

    if (!item_name || item_name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const now = new Date().toISOString();
    db.run(
      'INSERT INTO orders (item_name, quantity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [item_name.trim(), quantity, 'Preparing', now, now]
    );

    const result = db.exec('SELECT last_insert_rowid()');
    const newId = result[0].values[0][0];

    const orderResult = db.exec(`SELECT * FROM orders WHERE id = ${newId}`);
    const row = orderResult[0].values[0];
    const newOrder = {
      id: row[0],
      item_name: row[1],
      quantity: row[2],
      status: row[3],
      created_at: row[4],
      updated_at: row[5]
    };

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    await initDb();
    const { id } = req.params;

    const result = db.exec(`SELECT * FROM orders WHERE id = ${id}`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const row = result[0].values[0];
    const order = {
      id: row[0],
      item_name: row[1],
      quantity: row[2],
      status: row[3],
      created_at: row[4],
      updated_at: row[5]
    };

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) {
      return res.status(400).json({ error: 'Order is already completed' });
    }

    const newStatus = STATUS_FLOW[currentIndex + 1];
    const now = new Date().toISOString();
    db.run(`UPDATE orders SET status = '${newStatus}', updated_at = '${now}' WHERE id = ${id}`);

    const updatedResult = db.exec(`SELECT * FROM orders WHERE id = ${id}`);
    const updatedRow = updatedResult[0].values[0];
    const updatedOrder = {
      id: updatedRow[0],
      item_name: updatedRow[1],
      quantity: updatedRow[2],
      status: updatedRow[3],
      created_at: updatedRow[4],
      updated_at: updatedRow[5]
    };

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = app;
