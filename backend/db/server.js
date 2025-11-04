import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { query, initDatabase } from './db/config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database on server start
initDatabase();

// User Registration API
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;

    // Validation
    if (!fullName || fullName.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Full name must be at least 3 characters long' 
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number must be 10 digits' 
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if email already exists
    const existingEmail = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Check if mobile already exists
    const existingMobile = await query(
      'SELECT * FROM users WHERE mobile = $1',
      [mobile]
    );

    if (existingMobile.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number already registered' 
      });
    }

    // Generate user ID (EP + random number)
    const generateUserId = () => {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      return `EP${randomNum}`;
    };

    let userId = generateUserId();
    let userIdExists = true;
    let attempts = 0;

    // Ensure unique user ID
    while (userIdExists && attempts < 10) {
      const checkUser = await query(
        'SELECT * FROM users WHERE user_id = $1',
        [userId]
      );
      if (checkUser.rows.length === 0) {
        userIdExists = false;
      } else {
        userId = generateUserId();
        attempts++;
      }
    }

    if (userIdExists) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate unique user ID' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (user_id, full_name, email, mobile, password) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, full_name, email, mobile, created_at`,
      [userId, fullName, email, mobile, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        fullName: result.rows[0].full_name,
        email: result.rows[0].email,
        mobile: result.rows[0].mobile,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// User Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Find user by user_id, email, or mobile
    const result = await query(
      `SELECT * FROM users 
       WHERE user_id = $1 OR email = $1 OR mobile = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user ID, email, or password' 
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid user ID, email, or password' 
      });
    }

    // Return user data (without password)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        mobile: user.mobile,
        totalEarning: user.total_earning,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await query(
      `SELECT id, user_id, full_name, email, mobile, total_earning, created_at 
       FROM users WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
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
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      time: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});