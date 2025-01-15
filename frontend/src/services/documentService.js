// src/services/documentService.js
import axios from 'axios';

const API_BASE_URL = '/api/documents';

export const documentService = {
  /**
   * Fetch documents for a specific entity
   * @param {string} entityType - Type of entity (vendor, estimate, etc.)
   * @param {number} entityId - ID of the specific entity
   */
  async getDocuments(entityType, entityId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${entityType}/${entityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  /**
   * Upload documents for an entity
   * @param {FormData} formData - Form data containing files and metadata
   */
  async uploadDocuments(formData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  },

  /**
   * Delete a specific document
   * @param {number} documentId - ID of the document to delete
   */
  async deleteDocument(documentId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Download a document
   * @param {Object} document - Document object with filename and path
   */
  downloadDocument(document) {
    // Implement download logic based on your file storage structure
    const downloadUrl = `/vendors/${document.file_path}`;
    window.open(downloadUrl, '_blank');
  },

  /**
   * Prepare form data for document upload
   * @param {File} file - File to upload
   * @param {string} entityType - Type of entity
   * @param {number} entityId - ID of the entity
   * @param {string} category - Document category
   * @param {string} description - Optional document description
   */
  prepareUploadFormData(file, entityType, entityId, category, description = '') {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    formData.append('category', category);
    formData.append('description', description);
    return formData;
  }
};

// Predefined document categories for convenience
export const DOCUMENT_CATEGORIES = [
  'Invoice',
  'Contract',
  'W9',
  'Insurance',
  'Specifications',
  'Product Data',
  'Technical Document',
  'Other'
];

export default documentService;