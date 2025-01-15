// src/api/clientService.js
const API_BASE_URL = 'http://localhost:5000/api';

export const clientService = {
  /**
   * Fetch all clients
   * @param {Object} filters - Optional filters for fetching clients
   * @returns {Promise<Array>} List of clients
   */
  async fetchClients(filters = {}) {
    try {
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v != null)
      ).toString();

      const response = await fetch(`${API_BASE_URL}/clients?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  /**
   * Fetch a single client by ID
   * @param {number} id - Client ID
   * @returns {Promise<Object>} Client details
   */
  async fetchClientById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch client');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  /**
   * Create a new client
   * @param {Object} clientData - Client details
   * @returns {Promise<Object>} Created client
   */
  async createClient(clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  /**
   * Update an existing client
   * @param {number} id - Client ID
   * @param {Object} clientData - Updated client details
   * @returns {Promise<Object>} Updated client
   */
  async updateClient(id, clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update client');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }
};

export default clientService;
