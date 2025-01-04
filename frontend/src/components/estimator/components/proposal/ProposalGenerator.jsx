// src/components/estimator/components/proposal/ProposalGenerator.jsx
import React from 'react';
import { useProposalGeneration } from '@/hooks/useProposalGeneration';

export const ProposalGenerator = ({ projectData, onGenerated }) => {
  const { generate, isGenerating, error } = useProposalGeneration();

  const handleGenerate = async () => {
    try {
      const content = await generate(projectData);
      onGenerated?.(content);
    } catch (err) {
      console.error('Failed to generate proposal:', err);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full px-4 py-2 text-white rounded ${
          isGenerating ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isGenerating ? 'Generating Proposal...' : 'Generate Professional Proposal'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};
