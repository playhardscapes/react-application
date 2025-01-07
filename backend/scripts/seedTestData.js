// scripts/seedTestData.js
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');

async function seedTestData() {
  try {
    // Read test data file
    const testData = await fs.readFile(
      path.join(__dirname, '../migrations/002_test_data.sql'),
      'utf8'
    );

    // Run test data insertion
    await db.query(testData);
    
    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  } finally {
    db.pool.end();
  }
}

seedTestData();