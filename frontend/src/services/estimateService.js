// src/services/estimateService.js
import { API_BASE_URL } from '@/config/api';

// Default logistics values
const DEFAULT_LOGISTICS = {
  travelDays: 2,
  numberOfTrips: 1,
  generalLaborHours: 0,
  hotelRate: 150,
  logisticalNotes: '',
  distanceToSite: 0
};

// Cleanup function to remove unnecessary fields
const cleanEstimateData = (estimateData) => {
  // Create a deep copy to avoid mutating original data
  const cleanedData = JSON.parse(JSON.stringify(estimateData));

  // Remove any unnecessary fields
  delete cleanedData.isClientSelected;

  // Ensure basketball_systems is an array
  if (!Array.isArray(cleanedData.basketball_systems)) {
    cleanedData.basketball_systems = [];
  }

  // Ensure logistics is present
  cleanedData.logistics = {
    ...DEFAULT_LOGISTICS,
    ...(cleanedData.logistics || {})
  };

  // Ensure client details are preserved
  const clientFields = [
    'client_id', 
    'client_name', 
    'client_email', 
    'client_phone'
  ];

  clientFields.forEach(field => {
    if (cleanedData[field] === null || cleanedData[field] === undefined) {
      delete cleanedData[field];
    }
  });

  return cleanedData;
};

export const fetchEstimates = async (filter = 'all') => {
  try {
    // Only add status parameter if filter is not 'all'
    const url = filter === 'all' 
      ? `${API_BASE_URL}/estimates` 
      : `${API_BASE_URL}/estimates?status=${filter}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch estimates');
    }
    
    const data = await response.json();
    return data.estimates || [];
  } catch (error) {
    console.error('Error fetching estimates:', error);
    throw error;
  }
};

export const createEstimate = async (estimateData) => {
  try {
    // Clean and prepare the estimate data
    const cleanedEstimateData = cleanEstimateData(estimateData);

    // Log the full request body for debugging
    console.log('Creating estimate with cleaned data:', cleanedEstimateData);

    const response = await fetch(`${API_BASE_URL}/estimates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedEstimateData),
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
    // Clean and prepare the estimate data
    const cleanedEstimateData = cleanEstimateData(estimateData);

    const response = await fetch(`${API_BASE_URL}/estimates/${estimateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedEstimateData),
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

export const getEstimateById = async (estimateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/estimates/${estimateId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch estimate');
    }

    const estimate = await response.json();

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

export const deleteEstimate = async (estimateId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/estimates/${estimateId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete estimate');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting estimate:', error);
    throw error;
  }
};

// Create an object to export as a named export
export const estimateService = {
  fetchEstimates,
  createEstimate,
  updateEstimate,
  getEstimateById,
  deleteEstimate
};