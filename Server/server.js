const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/database');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;
let dbReady = false;
let startupError = null;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const status = startupError ? 'error' : dbReady ? 'ok' : 'starting';
  const statusCode = startupError ? 500 : dbReady ? 200 : 503;

  res.status(statusCode).json({
    status,
    dbReady,
    error: startupError ? startupError.message : null
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'restaurant-order-tracker-api',
    status: 'online',
    health: '/api/health'
  });
});

app.use('/api/orders', (req, res, next) => {
  if (startupError) {
    return res.status(500).json({ message: 'Database initialization failed' });
  }

  if (!dbReady) {
    return res.status(503).json({ message: 'Server is starting up, please retry shortly' });
  }

  next();
}, ordersRouter);

process.on('unhandledRejection', reason => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize database after the server is listening so deployment platforms
// return a JSON health response instead of a connection failure during startup.
initDb().then(() => {
  dbReady = true;
  console.log('Database initialized successfully');
}).catch(err => {
  startupError = err;
  console.error('Failed to initialize database:', err);
});
