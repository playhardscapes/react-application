// src/services/pricingService.js
import axios from 'axios';

const API_URL = '/api/pricing';

const handleApiError = (error) => {
  console.error('Full API Error:', error);

  // More detailed error handling
  if (error.response) {
    // The request was made and the server responded with a status code
    console.error('Server Error Response:', error.response);
    const errorMessage = 
      error.response.data?.error ||
      error.response.data?.message ||
      'Failed to fetch pricing configurations';
    
    const errorStatus = error.response.status;

    // Different handling based on error type
    switch (errorStatus) {
      case 401:
        throw new Error('Authentication failed. Please log in again.');
      case 403:
        throw new Error('You do not have permission to access pricing configurations.');
      case 404:
        throw new Error('No pricing configurations found.');
      case 500:
        throw new Error('Server error. Please try again later or contact support.');
      default:
        throw new Error(errorMessage);
    }
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response from server. Check your network connection.');
  } else {
    // Something happened in setting up the request
    throw new Error('Error setting up the request: ' + error.message);
  }
};

export const getPricingConfigurations = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createPricingConfiguration = async (data, token) => {
  try {
    const response = await axios.post(API_URL, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updatePricingConfiguration = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deletePricingConfiguration = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPricingByCategory = async (category, token) => {
  try {
    const response = await axios.get(`${API_URL}/category/${category}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};