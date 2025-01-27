// src/services/clientService.js
import axios from 'axios';

const API_BASE_URL = '/api/clients';

const createAxiosInstance = (token) => {
  return axios.create({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

export const archiveClient = async (clientId, token) => {
  const api = createAxiosInstance(token);
  try {
    const response = await api.put(`${API_BASE_URL}/${clientId}/archive`);
    return response.data;
  } catch (error) {
    console.error('Error archiving client:', error);
    throw error;
  }
};

export const unarchiveClient = async (clientId, token) => {
  const api = createAxiosInstance(token);
  try {
    const response = await api.put(`${API_BASE_URL}/${clientId}/unarchive`);
    return response.data;
  } catch (error) {
    console.error('Error unarchiving client:', error);
    throw error;
  }
};

export const getClients = async (token) => {
  const api = createAxiosInstance(token);
  try {
    const response = await api.get(API_BASE_URL);
    return response.data.clients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getClientById = async (clientId, token) => {
  const api = createAxiosInstance(token);
  try {
    const response = await api.get(`${API_BASE_URL}/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};