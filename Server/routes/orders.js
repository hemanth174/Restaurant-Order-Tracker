const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../db/database');

const STATUS_FLOW = ['Preparing', 'Ready', 'Completed'];

function rowToOrder(row) {
  return {
    id: row[0],
    item_name: row[1],
    quantity: row[2],
    status: row[3],
    created_at: row[4],
    updated_at: row[5]
  };
}

function getOrders() {
  const db = getDb();
  const result = db.exec('SELECT * FROM orders ORDER BY created_at DESC');

  if (result.length === 0) {
    return [];
  }

  return result[0].values.map(rowToOrder);
}

function getOrderById(id) {
  const db = getDb();
  const result = db.exec(`SELECT * FROM orders WHERE id = ${id}`);

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  return rowToOrder(result[0].values[0]);
}

router.get('/', (req, res) => {
  try {
    res.json({
      message: 'Orders fetched successfully',
      orders: getOrders()
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to fetch orders. Please try again.' });
  }
});

router.post('/', (req, res) => {
  try {
    const { item_name, quantity = 1 } = req.body;

    if (!item_name || item_name.trim() === '') {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const db = getDb();
    const now = new Date().toISOString();
    db.run(
      'INSERT INTO orders (item_name, quantity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [item_name.trim(), quantity, 'Preparing', now, now]
    );

    const result = db.exec('SELECT last_insert_rowid()');
    const newId = result[0].values[0][0];

    saveDb();

    res.status(201).json({
      message: 'Order created successfully',
      order: getOrderById(newId)
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to create order. Please try again.' });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const order = getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) {
      return res.status(400).json({ message: 'Order is already completed' });
    }

    const newStatus = STATUS_FLOW[currentIndex + 1];
    const now = new Date().toISOString();
    db.run(`UPDATE orders SET status = '${newStatus}', updated_at = '${now}' WHERE id = ${id}`);
    saveDb();

    res.json({
      message: `Order moved to ${newStatus}`,
      order: getOrderById(id)
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to update order status. Please try again.' });
  }
});

module.exports = router;
