// scripts/seedToolDataWithFallback.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function ensureUser(client) {
  // Check if any users exist
  const userResult = await client.query('SELECT id FROM users LIMIT 1');
  
  if (userResult.rows.length === 0) {
    // Insert a default user if none exists
    const insertUserQuery = `
      INSERT INTO users (name, email, role, created_at, updated_at)
      VALUES ('System Admin', 'system@playhardscapes.com', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const userInsertResult = await client.query(insertUserQuery);
    return userInsertResult.rows[0].id;
  }
  
  return userResult.rows[0].id;
}

async function ensureProject(client, userId) {
  // Check if any projects exist
  const projectResult = await client.query('SELECT id FROM projects LIMIT 1');
  
  if (projectResult.rows.length === 0) {
    // Insert a default project if none exists
    const insertProjectQuery = `
      INSERT INTO projects (
        title, client_id, status, start_date, 
        created_at, updated_at, assigned_team_lead
      ) VALUES (
        'Initial Project', 
        NULL, 
        'pending', 
        CURRENT_DATE, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP,
        $1
      ) RETURNING id
    `;
    const projectInsertResult = await client.query(insertProjectQuery, [userId]);
    return projectInsertResult.rows[0].id;
  }
  
  return projectResult.rows[0].id;
}

async function cleanupToolData() {
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Ensure we have a user
    const userId = await ensureUser(client);

    // Ensure we have a project
    const projectId = await ensureProject(client, userId);

    // Remove existing maintenance and assignment records
    await client.query('DELETE FROM tool_maintenance');
    await client.query('DELETE FROM tool_assignments');

    // Prepare tools data
    const toolsToInsert = [
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

    // Insert or update tools
    const toolIds = [];
    for (const tool of toolsToInsert) {
      const result = await client.query(
        `INSERT INTO tools (
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
        RETURNING id`,
        [
          tool.name, tool.serial_number, tool.brand, tool.model, 
          tool.type, tool.status, tool.purchase_date, tool.purchase_price, 
          tool.expected_lifetime_months, tool.maintenance_interval_days, 
          tool.notes
        ]
      );
      
      toolIds.push(result.rows[0].id);
    }

    // Insert maintenance records
    const maintenanceQuery = `
      INSERT INTO tool_maintenance (
        tool_id, maintenance_date, next_maintenance_date, 
        maintenance_type, performed_by, cost, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const toolId of toolIds) {
      const lastMaintenanceDate = new Date();
      lastMaintenanceDate.setMonth(lastMaintenanceDate.getMonth() - 2);
      
      const nextMaintenanceDate = new Date();
      nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 2);

      await client.query(maintenanceQuery, [
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
    const assignmentQuery = `
      INSERT INTO tool_assignments (
        tool_id, project_id, checked_out_by, 
        checked_out_at, expected_return_date, 
        condition_out, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const toolId of toolIds) {
      const checkoutDate = new Date();
      const expectedReturnDate = new Date();
      expectedReturnDate.setDate(checkoutDate.getDate() + 14);

      await client.query(assignmentQuery, [
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

    console.log('Tool data cleaned and reseeded successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error cleaning and seeding tool data:', error);
    throw error; // Re-throw to ensure error is visible
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupToolData();