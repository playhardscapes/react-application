// scripts/seedToolDataPostgresUpsert.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedToolData() {
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Ensure a user exists
    let userId = await client.query('SELECT id FROM users LIMIT 1');
    if (userId.rows.length === 0) {
      const userResult = await client.query(`
        INSERT INTO users (name, email, role, created_at, updated_at)
        VALUES ('System Admin', 'system@playhardscapes.com', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `);
      userId = userResult.rows[0].id;
    } else {
      userId = userId.rows[0].id;
    }

    // Ensure a project exists
    let projectId = await client.query('SELECT id FROM projects LIMIT 1');
    if (projectId.rows.length === 0) {
      const projectResult = await client.query(`
        INSERT INTO projects (
          title, status, start_date, 
          created_at, updated_at, assigned_team_lead
        ) VALUES (
          'Initial Project', 
          'pending', 
          CURRENT_DATE, 
          CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP,
          $1
        ) RETURNING id
      `, [userId]);
      projectId = projectResult.rows[0].id;
    } else {
      projectId = projectId.rows[0].id;
    }

    // Clear existing data
    await client.query('DELETE FROM tool_maintenance');
    await client.query('DELETE FROM tool_assignments');

    // Prepare tools data
    const tools = [
      {
        name: 'Cordless Drill',
        serial_number: 'DRILL-001',
        brand: 'DeWalt',
        model: 'DCD796',
        type: 'Power Tool',
        status: 'available',
        purchase_date: new Date(),
        purchase_price: 249.99,
        expected_lifetime_months: 60,
        maintenance_interval_days: 180,
        notes: 'Professional grade cordless drill'
      },
      {
        name: 'Concrete Mixer',
        serial_number: 'MIXER-001',
        brand: 'Ryobi',
        model: 'RY-CM1636',
        type: 'Construction Equipment',
        status: 'available',
        purchase_date: new Date(),
        purchase_price: 599.99,
        expected_lifetime_months: 120,
        maintenance_interval_days: 365,
        notes: 'Heavy-duty concrete mixer'
      }
    ];

    // Insert or update tools and track their IDs
    const toolIds = [];
    for (const tool of tools) {
      const result = await client.query(`
        INSERT INTO tools (
          name, serial_number, brand, model, type, status, 
          purchase_date, purchase_price, expected_lifetime_months,
          maintenance_interval_days, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (serial_number, brand, model) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          status = EXCLUDED.status,
          purchase_date = EXCLUDED.purchase_date,
          purchase_price = EXCLUDED.purchase_price,
          expected_lifetime_months = EXCLUDED.expected_lifetime_months,
          maintenance_interval_days = EXCLUDED.maintenance_interval_days,
          notes = EXCLUDED.notes
        RETURNING id
      `, [
        tool.name, tool.serial_number, tool.brand, tool.model, 
        tool.type, tool.status, tool.purchase_date, tool.purchase_price, 
        tool.expected_lifetime_months, tool.maintenance_interval_days, 
        tool.notes
      ]);
      
      toolIds.push(result.rows[0].id);
    }

    // Insert maintenance records
    for (const toolId of toolIds) {
      const lastMaintenanceDate = new Date();
      lastMaintenanceDate.setMonth(lastMaintenanceDate.getMonth() - 2);
      
      const nextMaintenanceDate = new Date();
      nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 2);

      await client.query(`
        INSERT INTO tool_maintenance (
          tool_id, maintenance_date, next_maintenance_date, 
          maintenance_type, performed_by, cost, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        toolId,
        lastMaintenanceDate,
        nextMaintenanceDate,
        'routine',
        userId,
        50.00,
        'Routine maintenance and inspection'
      ]);
    }

    // Insert tool assignments
    for (const toolId of toolIds) {
      const checkoutDate = new Date();
      const expectedReturnDate = new Date();
      expectedReturnDate.setDate(checkoutDate.getDate() + 14);

      await client.query(`
        INSERT INTO tool_assignments (
          tool_id, project_id, checked_out_by, 
          checked_out_at, expected_return_date, 
          condition_out, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        toolId,
        projectId,
        userId,
        checkoutDate,
        expectedReturnDate,
        'Good condition',
        'Checked out for current project'
      ]);
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('Tool data seeded successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error seeding tool data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedToolData();