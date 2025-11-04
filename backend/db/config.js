import pg from 'pg';
const { Pool } = pg;

console.log('🔧 Database Configuration:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('- NODE_ENV:', process.env.NODE_ENV);

let pool;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false 
    },
    // Add connection timeouts
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20 // Limit connections
  });

  // Test connection immediately
  pool.on('connect', () => {
    console.log('✅ New database connection established');
  });

  pool.on('error', (err) => {
    console.error('❌ Database pool error:', err);
  });

  console.log('✅ Database pool created successfully');
} catch (error) {
  console.error('❌ Failed to create database pool:', error.message);
  pool = null;
}

// Test database connection with timeout
export const testConnection = async () => {
  if (!pool) {
    return {
      success: false,
      message: 'Database pool not available'
    };
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    console.log('✅ Database connection test successful');
    return {
      success: true,
      message: 'Database connected successfully',
      time: result.rows[0].current_time
    };
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return {
      success: false,
      message: 'Database connection failed',
      error: error.message
    };
  }
};

// Initialize database with error handling
export const initDatabase = async () => {
  if (!pool) {
    console.log('⚠️ Database pool not available, skipping initialization');
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

// Safe query function
export const query = (text, params) => {
  if (!pool) {
    throw new Error('Database pool not available');
  }
  return pool.query(text, params);
};

export { pool };