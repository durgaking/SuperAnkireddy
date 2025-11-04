import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { query, initDatabase, testConnection } from './db/config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check - should always work
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Super26 Backend Server is running!',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'Configured' : 'Not configured'
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// User Registration - with database error handling
app.post('/api/auth/signup', async (req, res) => {
  try {
    // Check if database is available
    const dbTest = await testConnection();
    if (!dbTest.success) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        error: dbTest.error
      });
    }

    const { fullName, email, mobile, password } = req.body;

    // ... rest of your signup code ...

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// User Login - with database error handling
app.post('/api/auth/login', async (req, res) => {
  try {
    // Check if database is available
    const dbTest = await testConnection();
    if (!dbTest.success) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable',
        error: dbTest.error
      });
    }

    const { userId, password } = req.body;

    // ... rest of your login code ...

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Initialize database (but don't crash the server if it fails)
initDatabase().then(success => {
  console.log(success ? '✅ Database ready' : '⚠️ Database not available');
}).catch(error => {
  console.error('❌ Database initialization error:', error);
});

// Start server (this should always work)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});