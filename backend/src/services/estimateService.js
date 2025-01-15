// src/services/estimateService.js
const API_BASE_URL = 'http://localhost:5000/api';

// Default logistics values
const DEFAULT_LOGISTICS = {
  travelDays: 2,
  numberOfTrips: 1,
  generalLaborHours: 0,
  hotelRate: 150,
  logisticalNotes: '',
  distanceToSite: 0
};

export const createEstimate = async (estimateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/estimates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estimateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.error || 'Failed to create estimate');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
};

export const updateEstimate = async (estimateId, estimateData) => {
  try {
    // Merge default logistics with provided data
    const dataWithDefaultLogistics = {
      ...estimateData,
      logistics: {
        ...DEFAULT_LOGISTICS,
        ...(estimateData.logistics || {})
      }
    };

    const response = await fetch(`${API_BASE_URL}/estimates/${estimateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataWithDefaultLogistics),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update estimate');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating estimate:', error);
    throw error;
  }
};

// Helper function to fetch client details
const fetchClientDetails = async (clientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch client details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching client details:', error);
    return null;
  }
};

export const getEstimateById = async (estimateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/estimates/${estimateId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch estimate');
    }

    const estimate = await response.json();

    // If there's a client_id, fetch the client details
    if (estimate.client_id) {
      const clientDetails = await fetchClientDetails(estimate.client_id);
      if (clientDetails) {
        estimate.client_name = clientDetails.name;
        estimate.client_email = clientDetails.email;
        estimate.client_phone = clientDetails.phone;
      }
    }

    // Ensure default logistics are present
    return {
      ...estimate,
      logistics: {
        ...DEFAULT_LOGISTICS,
        ...(estimate.logistics || {})
      }
    };
  } catch (error) {
    console.error('Error fetching estimate:', error);
    throw error;
  }
};