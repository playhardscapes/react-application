// src/services/documentServiceClient.js

class DocumentServiceClient {
  async makeAuthenticatedRequest(endpoint, token, options = {}) {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getClients(token) {
    const data = await this.makeAuthenticatedRequest('/api/clients', token, { method: 'GET' });
    return data.clients?.filter(client => client.status === 'active') || [];
  }

  async getVendors(token) {
    const data = await this.makeAuthenticatedRequest('/api/vendors', token, { method: 'GET' });
    return Array.isArray(data) ? data : [];
  }

  async getProjects(token) {
    const data = await this.makeAuthenticatedRequest('/api/projects', token, { method: 'GET' });
    return Array.isArray(data) ? 
      data.filter(project => ['pending', 'in_progress', 'on_hold'].includes(project.status)) : 
      [];
  }

  async getDocumentsByEntity(entityType, entityId, token) {
    const data = await this.makeAuthenticatedRequest(
      `/api/documents/${entityType}/${entityId}`,
      token,
      { method: 'GET' }
    );
    return Array.isArray(data) ? data : [];
  }

  async deleteDocument(documentId, token) {
    return this.makeAuthenticatedRequest(
      `/api/documents/${documentId}`,
      token,
      { method: 'DELETE' }
    );
  }

  async uploadDocument(formData, token) {
    return this.makeAuthenticatedRequest('/api/documents/upload', token, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }
}

export default new DocumentServiceClient();