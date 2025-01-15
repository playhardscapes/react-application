// backend/scripts/runMigrations.js
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../src/config/database');

async function runMigrations() {
  let client;
  try {
    client = await pool.connect();

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of executed migrations
    const { rows } = await client.query('SELECT name FROM migrations');
    const executedMigrations = new Set(rows.map(row => row.name));

    // Read migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    console.log('Looking for migrations in:', migrationsDir);
    
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();
    
    console.log('Found migration files:', migrationFiles);
    console.log('Already executed migrations:', Array.from(executedMigrations));

    // Execute new migrations
    for (const file of migrationFiles) {
      if (!executedMigrations.has(file)) {
        console.log(`Running migration: ${file}`);
        const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
        
        await client.query('BEGIN');
        try {
          // Execute the entire SQL file as one statement
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Successfully executed migration: ${file}`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error('Error executing migration:', error);
          throw error;
        }
      } else {
        console.log(`Skipping already executed migration: ${file}`);
      }
    }

    // List all tables in the database
    console.log('Listing all tables in the database:');
    const tableResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log(tableResult.rows.map(row => row.table_name));

    // Check the structure of the "estimates" table
    console.log('Checking the structure of the "estimates" table:');
    const estimatesResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'estimates'
    `);
    console.log(estimatesResult.rows);

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.release();
    }
    await pool.end();
    process.exit(0);
  }
}

runMigrations();