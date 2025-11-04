import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { query, initDatabase, testConnection } from './db/config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware with error handling
app.use(cors());
app.use(bodyParser.json());

// Global error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  next();
});

// Health check - should always work
app.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Super26 Backend Server is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

// Simple API test - no database
app.get('/api/test', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API test failed'
    });
  }
});

// Database test endpoint with safe error handling
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await testConnection();
    
    if (result.success) {
      res.json(result);
    } else {
      // Don't return 500 for database errors, return 200 with error details
      res.json({
        success: false,
        message: 'Database test completed with errors',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Database test endpoint error:', error);
    res.json({
      success: false,
      message: 'Database test endpoint error',
      error: error.message
    });
  }
});

// Safe user registration with comprehensive error handling
app.post('/api/auth/signup', async (req, res) => {
  try {
    // Test database connection first
    const dbTest = await testConnection();
    if (!dbTest.success) {
      return res.json({
        success: false,
        message: 'Database temporarily unavailable',
        error: dbTest.error
      });
    }

    const { fullName, email, mobile, password } = req.body;

    // Basic validation
    if (!fullName || fullName.length < 3) {
      return res.json({
        success: false,
        message: 'Full name must be at least 3 characters long'
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    if (!mobile || mobile.length !== 10) {
      return res.json({
        success: false,
        message: 'Mobile number must be 10 digits'
      });
    }

    if (!password || password.length < 6) {
      return res.json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1 OR mobile = $2',
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.json({
        success: false,
        message: 'Email or mobile already registered'
      });
    }

    // Generate user ID
    const userId = 'EP' + Math.floor(10000 + Math.random() * 90000);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      `INSERT INTO users (user_id, full_name, email, mobile, password) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, full_name, email, mobile, created_at`,
      [userId, fullName, email, mobile, hashedPassword]
    );

    res.json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Safe login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const dbTest = await testConnection();
    if (!dbTest.success) {
      return res.json({
        success: false,
        message: 'Database temporarily unavailable'
      });
    }

    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.json({
        success: false,
        message: 'User ID and password are required'
      });
    }

    const result = await query(
      `SELECT * FROM users WHERE user_id = $1 OR email = $1 OR mobile = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        mobile: user.mobile,
        totalEarning: user.total_earning
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Global catch-all for unhandled routes
app.use('*', (req, res) => {
  res.json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Initialize database safely
const initializeApp = async () => {
  try {
    console.log('🚀 Starting Super26 Backend...');
    
    // Test database connection
    const dbTest = await testConnection();
    console.log(dbTest.success ? '✅ Database connected' : '❌ Database connection failed');
    
    if (dbTest.success) {
      await initDatabase();
    }
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log('✅ Application ready!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

initializeApp();