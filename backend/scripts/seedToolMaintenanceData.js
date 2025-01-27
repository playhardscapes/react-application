// scripts/seedToolMaintenanceData.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedToolMaintenanceData() {
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Fetch some existing tools and users
    const toolsResult = await client.query('SELECT id FROM tools LIMIT 2');
    const usersResult = await client.query('SELECT id FROM users LIMIT 1');

    if (toolsResult.rows.length === 0) {
      console.log('No tools found. Skipping maintenance seed.');
      return;
    }

    const toolId = toolsResult.rows[0].id;
    const userId = usersResult.rows.length > 0 ? usersResult.rows[0].id : null;

    // Calculate dates
    const today = new Date();
    const lastMaintenanceDate = new Date(today);
    lastMaintenanceDate.setMonth(today.getMonth() - 2);
    const nextMaintenanceDate = new Date(today);
    nextMaintenanceDate.setMonth(today.getMonth() + 2);

    // Insert maintenance record
    await client.query(`
      INSERT INTO tool_maintenance (
        tool_id, 
        maintenance_date, 
        next_maintenance_date, 
        maintenance_type, 
        performed_by, 
        cost, 
        description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      toolId,
      lastMaintenanceDate,
      nextMaintenanceDate,
      'routine',
      userId,
      50.00,
      'Routine maintenance check and lubrication'
    ]);

    // Commit transaction
    await client.query('COMMIT');

    console.log('Tool maintenance data seeded successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error seeding tool maintenance data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedToolMaintenanceData();