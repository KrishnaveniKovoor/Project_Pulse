const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

const rawClientUrls = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrls
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => {
    if (origin === '*') return '*';
    try {
      return new URL(origin).origin;
    } catch {
      return origin.replace(/\/+$/, '');
    }
  });

// Connect to database
connectDB();

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Check wildcard or exact match
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview/production domains
    if (origin.match(/^https:\/\/.*\.vercel\.app$/i)) return callback(null, true);

    // Allow Netlify preview/production domains
    if (origin.match(/^https:\/\/.*\.netlify\.app$/i)) return callback(null, true);

    // Allow Render domains
    if (origin.match(/^https:\/\/.*\.onrender\.com$/i)) return callback(null, true);

    // Allow loopback hosts on any port (for development)
    if (origin.match(/^http:\/\/(?:localhost|127(?:\.\d{1,3}){3})(:\d+)?$/i)) {
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Middleware: CORS must precede body parsers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ProjectPulse API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/sprints', require('./routes/sprints'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/reports', require('./routes/reports'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
