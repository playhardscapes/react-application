// src/services/clientService.js
const API_BASE_URL = '/api';

const clientService = {
  async fetchClients() {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`);
      if (!response.ok) {
        throw new Error(response.statusText || 'Failed to fetch clients');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  async getClientById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  async createClient(clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create client');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  async updateClient(id, clientData) {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update client');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }
};

export default clientService;