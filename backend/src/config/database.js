const { Pool } = require('pg');
require('dotenv').config();

console.log('Database Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  // Never log password
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected database error', err);
});

module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error('Database Query Error:', {
        query: text,
        params,
        error: error.message
      });
      throw error;
    }
  },
  pool
};