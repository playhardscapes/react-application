// src/api/estimateService.js
const API_BASE_URL = 'http://localhost:5000/api';

export const estimateService = {
  async createEstimate(estimateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(estimateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create estimate');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating estimate:', error);
      throw error;
    }
  },

  async getEstimateById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/estimates/${id}`);

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

  async updateEstimate(id, estimateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/estimates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(estimateData)
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
      const response = await fetch(`${API_BASE_URL}/estimates/${id}`, {
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

export default estimateService;