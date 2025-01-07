// src/services/proposalService.js
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generate a proposal from estimate data
 */
export const generateProposal = async (estimateData, selectedDocs) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proposals/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estimateData,
        supportingDocuments: selectedDocs
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate proposal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating proposal:', error);
    throw error;
  }
};

/**
 * Save proposal to database
 */
export const saveProposal = async (proposalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proposalData),
    });

    if (!response.ok) {
      throw new Error('Failed to save proposal');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving proposal:', error);
    throw error;
  }
};

/**
 * Send proposal email to client
 */
export const sendProposalEmail = async (proposalId, emailData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send proposal email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending proposal email:', error);
    throw error;
  }
};

/**
 * Get all proposals
 */
export const getProposals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/proposals`);
    if (!response.ok) {
      throw new Error('Failed to fetch proposals');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
};

/**
 * Get single proposal by ID
 */
export const getProposalById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/proposals/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch proposal');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching proposal:', error);
    throw error;
  }
};