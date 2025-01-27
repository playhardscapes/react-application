// scripts/seedInventoryData.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const materials = [
  {
    name: 'Cement',
    sku: 'CEMENT-001',
    category: 'Construction',
    unit: 'bag',
    unit_size: 50,
    min_quantity: 10,
    reorder_quantity: 50,
    notes: 'Portland cement for construction projects',
    reorder_point: 15,
    ideal_stock_level: 100,
    manufacturer: 'BuildCo',
    unit_cost: 12.50,
    lead_time_days: 14
  },
  {
    name: 'Sand',
    sku: 'SAND-001',
    category: 'Construction',
    unit: 'cubic yard',
    unit_size: 1,
    min_quantity: 5,
    reorder_quantity: 20,
    notes: 'Construction grade sand',
    reorder_point: 8,
    ideal_stock_level: 50,
    manufacturer: 'EarthSupply',
    unit_cost: 35.00,
    lead_time_days: 7
  },
  {
    name: 'Acrylic Resurfacer',
    sku: 'RESURF-001',
    category: 'Coating',
    unit: 'gallon',
    unit_size: 1,
    min_quantity: 10,
    reorder_quantity: 30,
    notes: 'Court resurfacing material',
    reorder_point: 15,
    ideal_stock_level: 50,
    manufacturer: 'CourtMaster',
    unit_cost: 125.00,
    lead_time_days: 10
  }
];

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
    last_maintenance_date: null,
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
    last_maintenance_date: null,
    notes: 'Heavy-duty concrete mixer'
  }
];

const materialLocations = [
  { name: 'Main Warehouse', address: '123 Supply St' },
  { name: 'Job Site Storage', address: '456 Construction Rd' }
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Insert material locations
    const locationResults = await Promise.all(
      materialLocations.map(loc => 
        client.query(
          'INSERT INTO material_locations (name, address) VALUES ($1, $2) RETURNING id', 
          [loc.name, loc.address]
        )
      )
    );

    const locationIds = locationResults.map(res => res.rows[0].id);

    // Insert materials
    const materialResults = await Promise.all(
      materials.map(mat => 
        client.query(
          `INSERT INTO materials (
            name, sku, category, unit, unit_size, min_quantity, 
            reorder_quantity, notes, reorder_point, ideal_stock_level, 
            manufacturer, unit_cost, lead_time_days
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
          RETURNING id`,
          [
            mat.name, mat.sku, mat.category, mat.unit, mat.unit_size, 
            mat.min_quantity, mat.reorder_quantity, mat.notes, 
            mat.reorder_point, mat.ideal_stock_level, 
            mat.manufacturer, mat.unit_cost, mat.lead_time_days
          ]
        )
      )
    );

    const materialIds = materialResults.map(res => res.rows[0].id);

    // Insert initial stock levels (assuming first location)
    await Promise.all(
      materialIds.map((matId, index) => 
        client.query(
          'INSERT INTO material_stock (material_id, location_id, quantity) VALUES ($1, $2, $3)',
          [matId, locationIds[0], 50] // Default 50 units
        )
      )
    );

    // Insert tools
    const toolResults = await Promise.all(
      tools.map(tool => 
        client.query(
          `INSERT INTO tools (
            name, serial_number, brand, model, type, status, 
            purchase_date, purchase_price, expected_lifetime_months,
            maintenance_interval_days, last_maintenance_date, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
          RETURNING id`,
          [
            tool.name, tool.serial_number, tool.brand, tool.model, 
            tool.type, tool.status, tool.purchase_date, tool.purchase_price, 
            tool.expected_lifetime_months, tool.maintenance_interval_days, 
            tool.last_maintenance_date, tool.notes
          ]
        )
      )
    );

    // Commit transaction
    await client.query('COMMIT');

    console.log('Inventory data seeded successfully!');
    console.log('Material IDs:', materialIds);
    console.log('Tool IDs:', toolResults.map(res => res.rows[0].id));
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();