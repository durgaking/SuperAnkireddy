import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { query, initDatabase, testConnection } from './db/config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));

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

// Health check
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

// Simple API test
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

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await testConnection();
    
    if (result.success) {
      res.json(result);
    } else {
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

// User Registration API with Referral ID
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

    const { fullName, email, mobile, password, referralId } = req.body;

    console.log('📝 Signup request:', { fullName, email, mobile, referralId });

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

    // Validate referral ID if provided
    let validReferralId = null;
    if (referralId && referralId.trim() !== '') {
      const formattedReferralId = referralId.toUpperCase().trim();
      const referrer = await query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [formattedReferralId]
      );

      if (referrer.rows.length === 0) {
        return res.json({
          success: false,
          message: 'Invalid referral ID'
        });
      }
      validReferralId = formattedReferralId;
      console.log('✅ Valid referral ID:', validReferralId);
    }

    // Generate user ID
    let userId;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      userId = 'EP' + Math.floor(10000 + Math.random() * 90000);
      const existingId = await query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [userId]
      );
      if (existingId.rows.length === 0) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.json({
        success: false,
        message: 'Failed to generate unique user ID'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with referral_id
    const result = await query(
      `INSERT INTO users (user_id, full_name, email, mobile, password, referral_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, full_name, email, mobile, referral_id, created_at`,
      [userId, fullName, email, mobile, hashedPassword, validReferralId]
    );

    console.log('✅ User registered successfully:', result.rows[0]);

    // Add referral bonus if referral ID is valid
    if (validReferralId) {
      try {
        await query(
          'UPDATE users SET total_earning = total_earning + 100 WHERE user_id = $1',
          [validReferralId]
        );
        console.log(`💰 Referral bonus added to: ${validReferralId}`);
      } catch (bonusError) {
        console.error('❌ Error adding referral bonus:', bonusError);
        // Don't fail the signup if bonus fails
      }
    }

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        fullName: result.rows[0].full_name,
        email: result.rows[0].email,
        mobile: result.rows[0].mobile,
        referralId: result.rows[0].referral_id,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// User Login API
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
        referralId: user.referral_id,
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

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await query(
      `SELECT id, user_id, full_name, email, mobile, referral_id, total_earning, created_at 
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.json({ 
      success: false, 
      message: 'Error fetching user profile',
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
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('✅ Application ready!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
};

initializeApp();