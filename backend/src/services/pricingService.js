// src/services/pricingService.js
const db = require('../config/database');
const {
  MATERIALS_PRICING,
  SERVICES_PRICING,
  EQUIPMENT_PRICING
} = require('../constants/pricing');

const pricingService = {
  /**
   * Get all pricing configurations
   * @returns {Promise<Array>} List of pricing configurations
   */
  async getAllPricingConfigurations() {
    const query = `
      SELECT *
      FROM pricing_configurations
      ORDER BY category, name
    `;
    const result = await db.query(query);
    return result.rows;
  },

  /**
   * Get a specific pricing configuration by ID
   * @param {number} id Pricing configuration ID
   * @returns {Promise<Object>} Pricing configuration
   */
  async getPricingConfigurationById(id) {
    const query = `
      SELECT *
      FROM pricing_configurations
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  /**
   * Create a new pricing configuration
   * @param {Object} configData Pricing configuration details
   * @returns {Promise<Object>} Created pricing configuration
   */
  async createPricingConfiguration(configData) {
    const query = `
      INSERT INTO pricing_configurations (
        name,
        category,
        value,
        unit,
        description,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const values = [
      configData.name,
      configData.category,
      configData.value,
      configData.unit || null,
      configData.description || null
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  /**
   * Migrate existing constant pricing to database
   * @returns {Promise<Array>} Imported pricing configurations
   */
  async migrateConstantPricing() {
    console.log('Starting pricing migration...');
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];

      // Helper function to safely get value
      const safeGetValue = (item) => {
        if (typeof item === 'object') {
          return item.price !== undefined ? item.price : 0;
        }
        return typeof item === 'number' ? item : 0;
      };

      // Migrate Materials Pricing
      for (const [name, value] of Object.entries(MATERIALS_PRICING)) {
        const materialConfig = {
          name,
          category: 'materials',
          value: safeGetValue(value),
          unit: 'per unit',
          description: `Pricing for ${name} material`
        };

        const query = `
          INSERT INTO pricing_configurations (
            name,
            category,
            value,
            unit,
            description,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (name, category) DO UPDATE
          SET value = $3, updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const result = await client.query(query, [
          materialConfig.name,
          materialConfig.category,
          materialConfig.value,
          materialConfig.unit,
          materialConfig.description
        ]);

        results.push(result.rows[0]);
        console.log(`Migrated material: ${name}`);
      }

      // Migrate Services Pricing
      for (const [name, value] of Object.entries(SERVICES_PRICING)) {
        const serviceConfig = {
          name,
          category: 'services',
          value: safeGetValue(value),
          unit: 'per unit',
          description: `Pricing for ${name} service`
        };

        const query = `
          INSERT INTO pricing_configurations (
            name,
            category,
            value,
            unit,
            description,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (name, category) DO UPDATE
          SET value = $3, updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;

        const result = await client.query(query, [
          serviceConfig.name,
          serviceConfig.category,
          serviceConfig.value,
          serviceConfig.unit,
          serviceConfig.description
        ]);

        results.push(result.rows[0]);
        console.log(`Migrated service: ${name}`);
      }

      // Migrate Equipment Pricing
      const processEquipmentPricing = (items, baseCategory) => {
        const configs = [];

        const processItem = (name, details, parentCategory = baseCategory) => {
          // If details is a primitive number, use it directly
          if (typeof details === 'number') {
            return [{
              name,
              category: parentCategory,
              value: details,
              unit: 'per unit',
              description: `Pricing for ${name}`
            }];
          }

          // If details is an object
          if (typeof details === 'object') {
            // If it has a direct price, create a config
            if (details.price !== undefined) {
              return [{
                name,
                category: parentCategory,
                value: details.price,
                unit: 'per item',
                description: details.installationTime
                  ? `Installation time: ${details.installationTime} hours`
                  : `Pricing for ${name}`
              }];
            }

            // If it's a nested object, recursively process
            return Object.entries(details).flatMap(([subName, subDetails]) =>
              processItem(`${name} - ${subName}`, subDetails, parentCategory)
            );
          }

          // If we can't process the item, return an empty array
          return [];
        };

        // Flatten the processing of different equipment categories
        Object.entries(items).forEach(([name, details]) => {
          configs.push(...processItem(name, details));
        });

        return configs;
      };

      // Process different equipment categories
      const equipmentCategories = [
        { name: 'posts', category: 'equipment/posts' },
        { name: 'basketball.systems', category: 'equipment/basketball/systems' },
        { name: 'windscreen', category: 'equipment/windscreen' },
        { name: 'basketball.extensions', category: 'equipment/basketball/extensions' },
        { name: 'installation', category: 'equipment/installation' }
      ];

      for (const { name, category } of equipmentCategories) {
        // Navigate to the nested object
        const categoryItems = name.split('.').reduce((acc, part) => acc[part], EQUIPMENT_PRICING);

        const equipmentConfigs = processEquipmentPricing(categoryItems, category);

        // Insert equipment configurations
        for (const config of equipmentConfigs) {
          const query = `
            INSERT INTO pricing_configurations (
              name,
              category,
              value,
              unit,
              description,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (name, category) DO UPDATE
            SET value = $3, updated_at = CURRENT_TIMESTAMP
            RETURNING *
          `;

          try {
            const result = await client.query(query, [
              config.name,
              config.category,
              config.value,
              config.unit,
              config.description
            ]);

            results.push(result.rows[0]);
            console.log(`Migrated equipment: ${config.name}`);
          } catch (insertError) {
            console.error(`Error inserting equipment item: ${config.name}`, insertError);
          }
        }
      }

      await client.query('COMMIT');

      console.log(`Migration completed. Imported ${results.length} pricing configurations.`);
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Migration failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = pricingService;
