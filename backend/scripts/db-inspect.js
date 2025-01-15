// scripts/db-inspect.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function inspectDatabase() {
  try {
    // List all tables
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    console.log('Tables in the database:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.tablename}`);
    });

    // Inspect estimates table structure
    const estimatesColumns = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        column_default
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = 'estimates'
      ORDER BY ordinal_position
    `);

    console.log('\nEstimates Table Structure:');
    estimatesColumns.rows.forEach(column => {
      console.log(
        `${column.column_name}: ${column.data_type}` + 
        (column.character_maximum_length ? 
          ` (${column.character_maximum_length})` : '') +
        (column.column_default ? 
          ` DEFAULT ${column.column_default}` : '')
      );
    });

    // Sample logistics data
    const logisticsDataResult = await pool.query(`
      SELECT 
        id, 
        logistics::text AS logistics_json 
      FROM estimates 
      LIMIT 5
    `);

    console.log('\nSample Logistics Data:');
    logisticsDataResult.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.logistics_json}`);
    });

  } catch (err) {
    console.error('Error inspecting database:', err);
  } finally {
    await pool.end();
  }
}

inspectDatabase();