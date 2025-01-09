// scripts/runMigrations.js

const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../src/config/database');

async function checkSchema() {
  let client;
  try {
    client = await pool.connect();
    
    console.log('\nChecking vendors table structure:');
    const tableResult = await client.query(`
      SELECT 
        column_name, 
        data_type,
        character_maximum_length,
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'vendors'
      ORDER BY 
        ordinal_position;
    `);
    
    console.log('\nColumns in vendors table:');
    console.table(tableResult.rows);

    console.log('\nChecking executed migrations:');
    const migrationsResult = await client.query('SELECT * FROM migrations ORDER BY executed_at;');
    console.log('\nExecuted migrations:');
    console.table(migrationsResult.rows);

  } catch (error) {
    console.error('Schema check error:', error);
  } finally {
    if (client) {
      client.release();
    }
  }
}

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

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function main() {
  try {
    if (process.argv[2] === 'check') {
      await checkSchema();
      await runMigrations();
    } else {
      await runMigrations();
    }
  } finally {
    await pool.end();
  }
}

main();