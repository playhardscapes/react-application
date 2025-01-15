// src/utils/validateEstimateData.js
import { useState } from 'react';

/**
 * Validate estimate data before submission
 * @param {Object} estimateData - The estimate data to validate
 * @returns {Object} Validation errors
 */
export const validateEstimateData = (estimateData) => {
  const errors = {};

  // Validate client information
  if (!estimateData.client_name) {
    errors.client_name = 'Client name is required';
  }

  // Validate email if provided
  if (estimateData.client_email && 
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(estimateData.client_email)) {
    errors.client_email = 'Invalid email format';
  }

  // Validate dimensions
  if (!estimateData.length || estimateData.length <= 0) {
    errors.length = 'Length must be greater than 0';
  }

  if (!estimateData.width || estimateData.width <= 0) {
    errors.width = 'Width must be greater than 0';
  }

  // Calculate and validate square footage
  const squareFootage = (estimateData.length || 0) * (estimateData.width || 0);
  if (squareFootage <= 0) {
    errors.square_footage = 'Invalid dimensions';
  }

  // Validate sports configurations
  const sports = estimateData.court_configuration?.sports || {};
  const validateSportConfig = (sport) => {
    if (sport.selected) {
      if (!sport.colors?.court) {
        errors[`${sport.type}_color`] = `${sport.type} court color is required`;
      }
      if (!sport.courtCount || sport.courtCount < 1) {
        errors[`${sport.type}_count`] = `Number of ${sport.type} courts must be at least 1`;
      }
    }
  };

  // Validate each sport configuration
  if (sports.tennis) validateSportConfig(sports.tennis);
  if (sports.pickleball) validateSportConfig(sports.pickleball);
  if (sports.basketball) validateSportConfig(sports.basketball);

  // Surface system validations
  const surfaceSystem = estimateData.surface_system || {};
  if (surfaceSystem.patchWork?.needed) {
    if (!surfaceSystem.patchWork.estimatedGallons || 
        surfaceSystem.patchWork.estimatedGallons <= 0) {
      errors.patch_work_gallons = 'Invalid patch work gallons';
    }
  }

  // Logistics validations
  const logistics = estimateData.logistics || {};
  if (!logistics.travelDays || logistics.travelDays < 1) {
    errors.travel_days = 'Travel days must be at least 1';
  }

  // Equipment validations
  const equipment = estimateData.equipment || {};
  const equipmentKeys = [
    'permanentTennisPoles', 
    'permanentPickleballPoles', 
    'mobilePickleballNets',
    'lowGradeWindscreen',
    'highGradeWindscreen'
  ];

  equipmentKeys.forEach(key => {
    if (equipment[key] && equipment[key] < 0) {
      errors[key] = `${key} cannot be negative`;
    }
  });

  return errors;
};

// Create a hook for estimate data management
export const useEstimateData = () => {
  const [estimateData, setEstimateData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    project_location: '',
    length: 0,
    width: 0,
    square_footage: 0,
    status: 'draft',
    court_configuration: {
      sports: {},
      apron: { color: '' }
    },
    surface_system: {
      needsPressureWash: true,
      needsAcidWash: false,
      patchWork: {
        needed: false,
        estimatedGallons: 0
      }
    },
    equipment: {
      permanentTennisPoles: 0,
      permanentPickleballPoles: 0,
      mobilePickleballNets: 0
    },
    logistics: {
      travelDays: 2,
      numberOfTrips: 1
    }
  });

  const [errors, setErrors] = useState({});

  const updateSection = (section, data) => {
    setEstimateData(prev => ({
      ...prev,
      [section]: { 
        ...prev[section], 
        ...data 
      }
    }));
  };

  const validateData = () => {
    const validationErrors = validateEstimateData(estimateData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const saveEstimate = async (isDraft = true) => {
    try {
      if (!validateData()) {
        return null;
      }

      const endpoint = isDraft 
        ? '/api/estimates/draft' 
        : '/api/estimates';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(estimateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save estimate');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving estimate:', error);
      setErrors({ 
        submit: error.message || 'Failed to save estimate' 
      });
      return null;
    }
  };

  return {
    estimateData,
    setEstimateData,
    updateSection,
    errors,
    saveEstimate,
    validateData
  };
};

// Service for estimate-related API calls
export const estimateService = {
  async getEstimateById(id) {
    try {
      const response = await fetch(`/api/estimates/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch estimate');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching estimate:', error);
      throw error;
    }
  },

  async listEstimates(filters = {}) {
    try {
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v != null)
      ).toString();

      const response = await fetch(`/api/estimates?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list estimates');
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing estimates:', error);
      throw error;
    }
  },

  async updateEstimate(id, updateData) {
    try {
      const response = await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
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
  },

  async deleteEstimate(id) {
    try {
      const response = await fetch(`/api/estimates/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete estimate');
      }

      return true;
    } catch (error) {
      console.error('Error deleting estimate:', error);
      throw error;
    }
  }
};