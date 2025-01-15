// src/services/pricingService.js
import axios from 'axios';

const API_URL = '/api/pricing';

const handleApiError = (error) => {
  console.error('Full API Error:', error);

  // Check if error has a response from the server
  if (error.response) {
    console.error('Server Error Response:', error.response);
    console.error('Status Code:', error.response.status);
    console.error('Error Details:', error.response.data);

    // More informative error message
    const errorMessage = error.response.data?.error ||
      error.response.data?.message ||
      'An unexpected error occurred';

    throw new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    throw new Error('No response from server. Please check your network connection.');
  } else {
    // Something happened in setting up the request
    console.error('Request setup error:', error.message);
    throw new Error('Error setting up the request. ' + error.message);
  }
};

export const getPricingConfigurations = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error; // Re-throw for component error handling
  }
};

export const getPricingConfigurationById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createPricingConfiguration = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updatePricingConfiguration = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deletePricingConfiguration = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getPricingByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
