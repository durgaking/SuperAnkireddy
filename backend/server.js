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

// User Registration API with Referral System
app.post('/api/auth/signup', async (req, res) => {
  try {
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

    let validReferralId = null;
    if (referralId && referralId.trim() !== '') {
      const formattedReferralId = referralId.toUpperCase().trim();
      const referrer = await query(
        'SELECT user_id, total_earning FROM users WHERE user_id = $1',
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (user_id, full_name, email, mobile, password, referral_id, total_earning) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, user_id, full_name, email, mobile, referral_id, total_earning, created_at`,
      [userId, fullName, email, mobile, hashedPassword, validReferralId, 0]
    );

    console.log('✅ User registered successfully:', result.rows[0]);

    if (validReferralId) {
      try {
        await query(
          'UPDATE users SET total_earning = total_earning + 10 WHERE user_id = $1',
          [validReferralId]
        );
        console.log(`💰 Referral bonus of ₹10 added to: ${validReferralId}`);
        
        const updatedReferrer = await query(
          'SELECT total_earning FROM users WHERE user_id = $1',
          [validReferralId]
        );
        console.log(`📊 ${validReferralId} total earning now: ₹${updatedReferrer.rows[0].total_earning}`);
      } catch (bonusError) {
        console.error('❌ Error adding referral bonus:', bonusError);
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
        totalEarning: result.rows[0].total_earning,
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

// Get referral statistics
app.get('/api/users/:userId/referral-stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userCheck = await query(
      'SELECT user_id, total_earning FROM users WHERE user_id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const referralCount = await query(
      'SELECT COUNT(*) as count FROM users WHERE referral_id = $1',
      [userId]
    );

    const referralDetails = await query(
      `SELECT user_id, full_name, email, mobile, created_at 
       FROM users WHERE referral_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const totalReferrals = parseInt(referralCount.rows[0].count);
    const referralEarnings = totalReferrals * 10;

    res.json({
      success: true,
      referralStats: {
        totalReferrals: totalReferrals,
        referralEarnings: referralEarnings,
        totalEarning: userCheck.rows[0].total_earning,
        referrals: referralDetails.rows
      }
    });

  } catch (error) {
    console.error('Get referral stats error:', error);
    res.json({ 
      success: false, 
      message: 'Error fetching referral statistics',
      error: error.message 
    });
  }
});

// Get full referral tree (hierarchical structure)
// Get full referral tree (hierarchical structure)
app.get('/api/tree', async (req, res) => {
  try {
    const dbTest = await testConnection();
    if (!dbTest.success) {
      return res.json({
        success: false,
        message: 'Database temporarily unavailable'
      });
    }

    const treeResult = await query(`
      WITH RECURSIVE referral_tree AS (
        SELECT 
          id, 
          user_id, 
          full_name, 
          email, 
          mobile, 
          referral_id,
          0 AS level,
          CAST(full_name AS TEXT) AS path,
          ARRAY[user_id::character varying] AS path_ids  -- Cast to character varying
        FROM users 
        WHERE referral_id IS NULL
        UNION ALL
        SELECT 
          u.id, 
          u.user_id, 
          u.full_name, 
          u.email, 
          u.mobile, 
          u.referral_id,
          rt.level + 1,
          rt.path || ' → ' || u.full_name,
          rt.path_ids || u.user_id
        FROM users u
        INNER JOIN referral_tree rt ON u.referral_id = rt.user_id
      )
      SELECT * FROM referral_tree
      ORDER BY path_ids;
    `);

    res.json({
      success: true,
      tree: treeResult.rows
    });

  } catch (error) {
    console.error('Tree query error:', error);
    res.json({
      success: false,
      message: 'Error fetching tree structure',
      error: error.message
    });
  }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, mobile } = req.body;

    const userCheck = await query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const result = await query(
      `UPDATE users SET full_name = $1, email = $2, mobile = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $4 RETURNING user_id, full_name, email, mobile`,
      [fullName, email, mobile, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.json({ 
      success: false, 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

// Admin endpoint to update earnings
app.post('/api/admin/update-earnings', async (req, res) => {
  try {
    const dbTest = await testConnection();
    if (!dbTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Database temporarily unavailable',
        error: dbTest.error
      });
    }

    const usersResult = await query(`
      SELECT 
          u.user_id,
          u.total_earning AS current_earning,
          COUNT(r.id) AS referral_count,
          COUNT(r.id) * 10 AS expected_earning
      FROM users u
      LEFT JOIN users r ON u.user_id = r.referral_id
      GROUP BY u.user_id, u.total_earning
    `);

    const users = usersResult.rows;
    let updatedCount = 0;

    for (const user of users) {
      if (user.current_earning !== user.expected_earning) {
        await query(
          'UPDATE users SET total_earning = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
          [user.expected_earning, user.user_id]
        );
        updatedCount++;
        console.log(`✅ Updated ${user.user_id}: ₹${user.current_earning} → ₹${user.expected_earning}`);
      }
    }

    res.json({
      success: true,
      message: `Earnings update completed. Updated ${updatedCount} users.`,
      updated: updatedCount
    });
  } catch (error) {
    console.error('❌ Error updating earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating earnings',
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
    
    const dbTest = await testConnection();
    console.log(dbTest.success ? '✅ Database connected' : '❌ Database connection failed');
    
    if (dbTest.success) {
      await initDatabase();
    }
    
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