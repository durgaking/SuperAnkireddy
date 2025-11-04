import pg from 'pg';
const { Pool } = pg;

console.log('🔧 Database Configuration:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('- NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

// Initialize database with users table
export const initDatabase = async () => {
  try {
    // First, check if the table exists and has referral_id column
    const tableCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'referral_id'
    `);

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        referral_id VARCHAR(50),
        total_earning DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableQuery);
    console.log('✅ Users table initialized successfully');

    // If referral_id column doesn't exist, add it
    if (tableCheck.rows.length === 0) {
      console.log('🔄 Adding referral_id column to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN referral_id VARCHAR(50)');
      console.log('✅ referral_id column added successfully');
    } else {
      console.log('✅ referral_id column already exists');
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    return false;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Database connected successfully');
    return {
      success: true,
      message: 'Database connected successfully',
      time: result.rows[0].now
    };
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return {
      success: false,
      message: 'Database connection failed',
      error: error.message
    };
  }
};

export const query = (text, params) => pool.query(text, params);
export { pool };