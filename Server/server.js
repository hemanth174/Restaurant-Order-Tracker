const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/database');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

let dbReady = false;
let startupError = null;

app.use(cors());
app.use(express.json());

function getHealthResponse() {
  if (startupError) {
    return {
      statusCode: 500,
      body: {
        status: 'error',
        dbReady: false,
        error: startupError.message
      }
    };
  }

  if (!dbReady) {
    return {
      statusCode: 503,
      body: {
        status: 'starting',
        dbReady: false,
        error: null
      }
    };
  }

  return {
    statusCode: 200,
    body: {
      status: 'ok',
      dbReady: true,
      error: null
    }
  };
}

function requireDatabase(req, res, next) {
  if (startupError) {
    return res.status(500).json({ message: 'Database initialization failed' });
  }

  if (!dbReady) {
    return res.status(503).json({ message: 'Server is starting up, please retry shortly' });
  }

  next();
}

async function connectDatabase() {
  try {
    await initDb();
    dbReady = true;
    console.log('Database initialized successfully');
  } catch (error) {
    startupError = error;
    console.error('Failed to initialize database:', error);
  }
}

app.get('/', (req, res) => {
  res.json({
    name: 'restaurant-order-tracker-api',
    status: 'online',
    health: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  const health = getHealthResponse();
  res.status(health.statusCode).json(health.body);
});

app.use('/api/orders', requireDatabase, ordersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDatabase();
});
