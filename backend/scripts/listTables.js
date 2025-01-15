require('dotenv').config(); // Load environment variables from .env
const { Pool } = require('pg');

// PostgreSQL connection configuration using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
});

(async () => {
  try {
    // Connect to the database
    const client = await pool.connect();

    console.log("Connected to the database.");

    // Get all table names
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.table_name);

    if (tables.length === 0) {
      console.log("No tables found in the database.");
      return;
    }

    console.log("Tables found:");
    console.log(tables);

    // Iterate over each table and fetch its entries
    for (const table of tables) {
      console.log(`\nFetching data from table: ${table}`);
      const dataQuery = `SELECT * FROM ${table} LIMIT 100;`; // Limit to avoid massive output
      const dataResult = await client.query(dataQuery);

      if (dataResult.rows.length === 0) {
        console.log(`Table "${table}" is empty.`);
      } else {
        console.log(dataResult.rows);
      }
    }

    client.release();
  } catch (err) {
    console.error("Error occurred while fetching tables or data:", err);
  } finally {
    await pool.end();
    console.log("Database connection closed.");
  }
})();
