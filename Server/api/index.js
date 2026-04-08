const express = require('express');
const cors = require('cors');

const app = express();

// In-memory storage (resets on cold start - Vercel limitation)
let orders = [];
let nextId = 1;

// Middleware
app.use(cors());
app.use(express.json());

const STATUS_FLOW = ['Preparing', 'Ready', 'Completed'];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    res.json(sortedOrders);
  } catch (err) {
    res.status(500).json({ message: 'Fetching Error please Try Again' });
  }
});

// Create order
app.post('/api/orders', (req, res) => {
  try {
    const { item_name, quantity = 1 } = req.body;

    if (!item_name || item_name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const now = new Date().toISOString();
    const newOrder = {
      id: nextId++,
      item_name: item_name.trim(),
      quantity,
      status: 'Preparing',
      created_at: now,
      updated_at: now
    };

    orders.push(newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) {
      return res.status(400).json({ error: 'Order is already completed' });
    }

    order.status = STATUS_FLOW[currentIndex + 1];
    order.updated_at = new Date().toISOString();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

module.exports = app;
