 
// src/api/pricing.js

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Save pricing configuration to the server
 * @param {import('../constants/pricing').PricingConfiguration} pricingData
 * @returns {Promise<void>}
 */
export const savePricingConfig = async (pricingData) => {
  const response = await fetch(`${API_BASE_URL}/save-pricing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pricingData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to save pricing configuration' }));
    throw new Error(error.message);
  }

  return response.json();
};

/**
 * Load pricing configuration from the server
 * @returns {Promise<import('../constants/pricing').PricingConfiguration>}
 */
export const loadPricingConfig = async () => {
  const response = await fetch(`${API_BASE_URL}/load-pricing`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to load pricing configuration' }));
    throw new Error(error.message);
  }

  return response.json();
};
