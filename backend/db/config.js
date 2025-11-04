import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Checking Database Configuration...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is missing!');
}

// Create pool with better error handling
let pool;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10 seconds
    idleTimeoutMillis: 30000,
  });

  console.log('✅ Database pool created successfully');
} catch (error) {
  console.error('❌ Failed to create database pool:', error);
  pool = null;
}

// Test connection function
export const testConnection = async () => {
  if (!pool) {
    return { success: false, error: 'Database pool not initialized' };
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    
    console.log('✅ Database connection test successful');
    return { 
      success: true, 
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version
    };
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return { 
      success: false, 
      error: error.message,
      details: 'Check DATABASE_URL and network connectivity'
    };
  }
};

// Initialize database with users table
export const initDatabase = async () => {
  if (!pool) {
    console.error('❌ Cannot initialize database: pool not available');
    return false;
  }

  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        total_earning DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableQuery);
    console.log('✅ Users table initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    return false;
  }
};

export const query = (text, params) => {
  if (!pool) {
    throw new Error('Database pool not available');
  }
  return pool.query(text, params);
};

export { pool };