import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database with users table
export const initDatabase = async () => {
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
    console.log('Users table initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const query = (text, params) => pool.query(text, params);
export { pool };