// scripts/seedToolDataCleanup.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function cleanupToolData() {
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Remove duplicate tools
    await client.query(`
      DELETE FROM tool_maintenance 
      WHERE tool_id IN (
        SELECT id FROM (
          SELECT id, 
                 ROW_NUMBER() OVER (PARTITION BY serial_number, brand, model ORDER BY id) as rn
          FROM tools
        ) t
        WHERE rn > 1
      );

    DELETE FROM tool_assignments 
      WHERE tool_id IN (
        SELECT id FROM (
          SELECT id, 
                 ROW_NUMBER() OVER (PARTITION BY serial_number, brand, model ORDER BY id) as rn
          FROM tools
        ) t
        WHERE rn > 1
      );

    DELETE FROM tools 
    WHERE id IN (
      SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY serial_number, brand, model ORDER BY id) as rn
        FROM tools
      ) t
      WHERE rn > 1
    );
    
    -- Reset sequence to ensure correct ID assignment
    SELECT setval('tools_id_seq', (SELECT MAX(id) FROM tools));
  `);

    // Fetch an existing user and project
    const userResult = await client.query('SELECT id FROM users LIMIT 1');
    const projectResult = await client.query('SELECT id FROM projects LIMIT 1');

    const userId = userResult.rows.length > 0 ? userResult.rows[0].id : null;
    const projectId = projectResult.rows.length > 0 ? projectResult.rows[0].id : null;

    // Insert or update tools with precise data
    const toolsQuery = `
      INSERT INTO tools (
        name, serial_number, brand, model, type, status, 
        purchase_date, purchase_price, expected_lifetime_months,
        maintenance_interval_days, last_maintenance_date, notes
      ) VALUES 
      ('Cordless Drill', 'DRILL-001', 'DeWalt', 'DCD796', 'Power Tool', 'available', 
       CURRENT_DATE, 249.99, 60, 180, NULL, 'Professional grade cordless drill'),
      ('Concrete Mixer', 'MIXER-001', 'Ryobi', 'RY-CM1636', 'Construction Equipment', 'available', 
       CURRENT_DATE, 599.99, 120, 365, NULL, 'Heavy-duty concrete mixer')
      ON CONFLICT (serial_number, brand, model) DO UPDATE 
      SET 
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        status = EXCLUDED.status,
        purchase_date = EXCLUDED.purchase_date,
        purchase_price = EXCLUDED.purchase_price,
        expected_lifetime_months = EXCLUDED.expected_lifetime_months,
        maintenance_interval_days = EXCLUDED.maintenance_interval_days,
        notes = EXCLUDED.notes
      RETURNING id
    `;
    const toolsResult = await client.query(toolsQuery);

    const toolIds = toolsResult.rows.map(row => row.id);

    // Remove existing maintenance and assignment records
    await client.query('DELETE FROM tool_maintenance');
    await client.query('DELETE FROM tool_assignments');

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

    // Insert tool assignments if a project exists
    if (projectId) {
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
    }

    // Commit transaction
    await client.query('COMMIT');

    console.log('Tool data cleaned and reseeded successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error cleaning and seeding tool data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupToolData();