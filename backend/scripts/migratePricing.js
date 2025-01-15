// scripts/migratePricing.js
const pricingService = require('../src/services/pricingService');

async function runPricingMigration() {
  try {
    console.log('Starting pricing configuration migration...');
    const results = await pricingService.migrateConstantPricing();
    console.log('Migration completed successfully');
    console.log(`Imported ${results.length} pricing configurations`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runPricingMigration();
