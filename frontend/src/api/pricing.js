// src/api/pricing.js
import { API_BASE_URL } from '@/config/api';

/**
 * Transform database pricing records into the structure expected by the estimator
 * @param {Array} pricingRecords - Raw pricing records from the database
 * @returns {Object} Structured pricing configuration
 */
const transformPricingData = (pricingRecords) => {
  console.log('Raw pricing records:', pricingRecords);
  
  const pricing = {
    materials: {},
    equipment: {
      posts: {},
      basketball: {
        systems: {},
        extensions: {}
      },
      windscreen: {},
      installation: {}
    },
    services: {}
  };

  pricingRecords.forEach(record => {
    console.log('Processing record:', record);
    const categories = record.category.split('/');
    
    switch (categories[0]) {
      case 'materials':
        console.log('Adding material:', record.name, record.value);
        pricing.materials[record.name] = parseFloat(record.value);
        break;
        
      case 'equipment':
        switch (categories[1]) {
          case 'posts':
            pricing.equipment.posts[record.name] = {
              price: parseFloat(record.value),
              installationTime: parseFloat(record.description?.match(/Installation time: (\d+\.?\d*) hours/)?.[1] || 0)
            };
            break;

          case 'basketball':
            if (categories[2] === 'systems') {
              const [type, mount] = record.name.split(' - ');
              if (!pricing.equipment.basketball.systems[type]) {
                pricing.equipment.basketball.systems[type] = {};
              }
              pricing.equipment.basketball.systems[type][mount] = {
                price: parseFloat(record.value),
                installationTime: parseFloat(record.description?.match(/Installation time: (\d+\.?\d*) hours/)?.[1] || 0)
              };
            } else if (categories[2] === 'extensions') {
              pricing.equipment.basketball.extensions.pricePerFoot = parseFloat(record.value);
            }
            break;

          case 'windscreen':
            pricing.equipment.windscreen[record.name] = {
              price: parseFloat(record.value),
              installationTime: parseFloat(record.description?.match(/Installation time: (\d+\.?\d*) hours/)?.[1] || 0)
            };
            break;

          case 'installation':
            pricing.equipment.installation[record.name] = parseFloat(record.value);
            break;
        }
        break;
        
      case 'services':
        console.log('Adding service:', record.name, record.value);
        pricing.services[record.name] = parseFloat(record.value);
        break;
    }
  });

  console.log('Transformed pricing:', pricing);
  return pricing;
};

/**
 * Load pricing configuration from the server
 */
export const loadPricingConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing`);

    if (!response.ok) {
      throw new Error('Failed to load pricing configuration');
    }

    const pricingRecords = await response.json();
    return transformPricingData(pricingRecords);
  } catch (error) {
    console.error('Error loading pricing configuration:', error);
    throw error;
  }
};

/**
 * Get pricing for a specific category
 */
export const getPricingByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/category/${category}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load pricing for category: ${category}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error loading ${category} pricing:`, error);
    throw error;
  }
};

/**
 * Update pricing configuration
 */
export const updatePricing = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update pricing');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating pricing:', error);
    throw error;
  }
};