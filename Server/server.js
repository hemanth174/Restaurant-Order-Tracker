const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/database');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

let dbReady = false;
let startupError = null;

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'https://restaurant-order-tracker-sand.vercel.app'
];

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
    : defaultAllowedOrigins
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-name']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
