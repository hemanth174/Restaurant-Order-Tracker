const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../db/database');

const STATUS_FLOW = ['Preparing', 'Ready', 'Completed'];

router.get('/', (req, res) => {
  const db = getDb();
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
});

router.post('/', (req, res) => {
  const { item_name, quantity = 1 } = req.body;
  
  if (!item_name || item_name.trim() === '') {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const db = getDb();
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO orders (item_name, quantity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [item_name.trim(), quantity, 'Preparing', now, now]
  );
  
  // Must get the ID before saveDb() is called, as db.export() clears last_insert_rowid()
  const result = db.exec('SELECT last_insert_rowid()');
  const newId = result[0].values[0][0];
  
  saveDb();
  
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
});

router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
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
  saveDb();

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
});

module.exports = router;
