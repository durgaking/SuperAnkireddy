import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { query, initDatabase, testConnection } from './db/config.js';

const app = express();

// Use Railway's provided PORT (or default to 3001 for local development)
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check - test if server is running
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Super26 Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Simple API test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API endpoint is working!',
    timestamp: new Date().toISOString()
  });
});

// Database connection test
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await testConnection();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database test failed',
      error: error.message 
    });
  }
});

// Your existing routes (keep all your signup, login code as-is)
app.post('/api/auth/signup', async (req, res) => {
  // ... your existing signup code ...
});

app.post('/api/auth/login', async (req, res) => {
  // ... your existing login code ...
});

app.get('/api/users/:userId', async (req, res) => {
  // ... your existing user profile code ...
});

// Initialize database on startup
initDatabase().then(success => {
  console.log(success ? '✅ Database ready' : '❌ Database setup failed');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});