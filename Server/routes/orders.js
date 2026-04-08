const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../db/database');

const STATUS_FLOW = ['Preparing', 'Ready', 'Completed'];
const ORDER_COLUMNS = 'id, user_name, item_name, quantity, status, created_at, updated_at';

function rowToOrder(row) {
  return {
    id: row[0],
    user_name: row[1],
    item_name: row[2],
    quantity: row[3],
    status: row[4],
    created_at: row[5],
    updated_at: row[6]
  };
}

function getUserName(req) {
  const userName = req.header('x-user-name');
  return typeof userName === 'string' ? userName.trim() : '';
}

function getOrders(userName) {
  const db = getDb();
  const result = db.exec(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE user_name = ? ORDER BY created_at DESC`,
    [userName]
  );

  if (result.length === 0) {
    return [];
  }

  return result[0].values.map(rowToOrder);
}

function getOrderById(id, userName) {
  const db = getDb();
  const result = db.exec(
    `SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ? AND user_name = ?`,
    [id, userName]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  return rowToOrder(result[0].values[0]);
}

router.get('/', (req, res) => {
  try {
    const userName = getUserName(req);

    if (!userName) {
      return res.status(400).json({ message: 'User name is required' });
    }

    res.json({
      message: 'Orders fetched successfully',
      orders: getOrders(userName)
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to fetch orders. Please try again.' });
  }
});

router.post('/', (req, res) => {
  try {
    const { item_name, quantity = 1, user_name } = req.body;
    const userName = typeof user_name === 'string' && user_name.trim()
      ? user_name.trim()
      : getUserName(req);

    if (!userName) {
      return res.status(400).json({ message: 'User name is required' });
    }

    if (!item_name || item_name.trim() === '') {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const db = getDb();
    const now = new Date().toISOString();
    db.run(
      'INSERT INTO orders (user_name, item_name, quantity, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userName, item_name.trim(), quantity, 'Preparing', now, now]
    );

    const result = db.exec('SELECT last_insert_rowid()');
    const newId = result[0].values[0][0];

    saveDb();

    res.status(201).json({
      message: 'Order created successfully',
      order: getOrderById(newId, userName)
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to create order. Please try again.' });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const userName = getUserName(req);
    const db = getDb();

    if (!userName) {
      return res.status(400).json({ message: 'User name is required' });
    }

    const order = getOrderById(id, userName);
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
      order: getOrderById(id, userName)
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to update order status. Please try again.' });
  }
});

module.exports = router;
