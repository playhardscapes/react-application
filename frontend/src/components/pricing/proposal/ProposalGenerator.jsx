 
// src/components/proposal/ProposalGenerator.jsx
import React, { useState } from 'react';
import { useMaterialsCosts } from '../../hooks/useMaterialsCosts';
import { useEquipmentCosts } from '../../hooks/useEquipmentCosts';
import { useLaborCosts } from '../../hooks/useLaborCosts';

const ProposalGenerator = ({ projectData, pricing, onProposalGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const materialsCosts = useMaterialsCosts(projectData.surfaceSystem, projectData.dimensions, pricing);
  const equipmentCosts = useEquipmentCosts(projectData.equipment);
  const laborCosts = useLaborCosts(projectData.logistics, 0, pricing);

  const generateProposal = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/proposal/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData: {
            ...projectData,
            costs: {
              materials: materialsCosts,
              equipment: equipmentCosts,
              labor: laborCosts
            }
          },
          supportingDocs: []  // Add any relevant supporting documents
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate proposal');
      }

      const data = await response.json();
      onProposalGenerated(data.content);
    } catch (err) {
      setError(err.message);
      console.error('Error generating proposal:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generateProposal}
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

export default ProposalGenerator;
