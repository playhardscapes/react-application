// src/components/estimator/components/proposal/ProposalGenerator.jsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { formatCurrency } from '@/utils/formatting';

const ProposalGenerator = ({ projectData, onGenerated }) => {
  const [selectedSections, setSelectedSections] = useState({
    clientInfo: true,
    projectDetails: true,
    courtSpecs: true,
    materials: true,
    equipment: true,
    logistics: true,
    pricing: true
  });

  const [aiModel, setAiModel] = useState('claude');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const toggleSection = (section) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckAll = () => {
    setSelectedSections(prev => 
      Object.keys(prev).reduce((acc, key) => ({...acc, [key]: true}), {})
    );
  };

  const handleUncheckAll = () => {
    setSelectedSections(prev => 
      Object.keys(prev).reduce((acc, key) => ({...acc, [key]: false}), {})
    );
  };

  const handleGenerate = async () => {
    console.log('Generate button clicked');
    setGenerating(true);
    setError(null);

    try {
      console.log('Sending data to backend:', {
        projectData,
        selectedSections,
        model: aiModel
      });

      const response = await fetch('/api/proposal/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData,
          selectedSections,
          model: aiModel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      if (data.content) {
        onGenerated && onGenerated(data.content);
      } else {
        throw new Error('No content received from API');
      }
    } catch (err) {
      console.error('Proposal generation failed:', err);
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generate Proposal</h2>
        <div className="space-x-4">
          <span className="text-sm font-medium">AI Model:</span>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="border rounded p-1"
          >
            <option value="claude">Claude</option>
            <option value="chatgpt">ChatGPT</option>
          </select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Client Information */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Client Information</h3>
            <Checkbox
              checked={selectedSections.clientInfo}
              onCheckedChange={() => toggleSection('clientInfo')}
            />
          </div>
          {selectedSections.clientInfo && (
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {projectData.client_name}</div>
              <div><strong>Email:</strong> {projectData.client_email}</div>
              <div><strong>Phone:</strong> {projectData.client_phone}</div>
              <div><strong>Location:</strong> {projectData.project_location}</div>
            </div>
          )}
        </Card>

        {/* Project Details */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Project Specifications</h3>
            <Checkbox
              checked={selectedSections.projectDetails}
              onCheckedChange={() => toggleSection('projectDetails')}
            />
          </div>
          {selectedSections.projectDetails && (
            <div className="space-y-2 text-sm">
              <div><strong>Dimensions:</strong> {projectData.length}' × {projectData.width}'</div>
              <div><strong>Total Area:</strong> {projectData.square_footage} sq ft</div>
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        <Button
          variant="outline"
          onClick={handleUncheckAll}
        >
          Uncheck All
        </Button>
        <Button
          variant="outline"
          onClick={handleCheckAll}
        >
          Check All
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6"
        >
          {generating ? 'Generating...' : 'Generate Proposal'}
        </Button>
      </div>
    </div>
  );
};

export default ProposalGenerator;