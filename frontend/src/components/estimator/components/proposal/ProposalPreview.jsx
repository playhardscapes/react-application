// src/components/estimator/components/proposal/ProposalPreview.jsx
import React from 'react';
import { useProposalGeneration } from '@/hooks/useProposalGeneration';

export const ProposalPreview = ({ content, clientInfo }) => {
  const { sendEmail, isSending, error } = useProposalGeneration();

  const handleSend = async () => {
    if (!clientInfo?.email) {
      alert('Client email is required');
      return;
    }

    try {
      await sendEmail(clientInfo.email, content, clientInfo);
    } catch (err) {
      console.error('Failed to send proposal:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSend}
          disabled={isSending}
          className={`px-4 py-2 text-white rounded ${
            isSending ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isSending ? 'Sending...' : 'Send Proposal'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
