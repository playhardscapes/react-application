// src/services/proposalService.js

const API_URL = 'http://localhost:5000/api';

export const generateProposal = async (projectData, supportingDocs = []) => {
  const response = await fetch(`${API_URL}/proposal/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectData,
      supportingDocs
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to generate proposal' }));
    throw new Error(error.message);
  }

  return response.json();
};

export const sendProposalEmail = async (to, content, clientInfo) => {
  const response = await fetch(`${API_URL}/notifications/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      subject: `Court Surfacing Proposal for ${clientInfo.name}`,
      proposal: content,
      clientInfo
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send proposal email');
  }

  return response.json();
};
