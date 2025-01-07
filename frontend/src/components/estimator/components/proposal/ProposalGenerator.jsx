// src/components/estimator/components/proposal/ProposalGenerator.jsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { formatCurrency } from '@/utils/formatting';

export const ProposalGenerator = ({ projectData, onGenerated }) => {
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
        model: aiModel // Changed from selectedModel to aiModel
      });

      const response = await fetch('http://localhost:5000/api/proposal/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData,
          selectedSections,
          model: aiModel // Changed from selectedModel to aiModel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      if (data.content) {
        onGenerated(data.content);
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
 {/* Add the error alert here */}
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
              <div><strong>Name:</strong> {projectData.clientInfo.name}</div>
              <div><strong>Email:</strong> {projectData.clientInfo.email}</div>
              <div><strong>Phone:</strong> {projectData.clientInfo.phone}</div>
              <div><strong>Location:</strong> {projectData.clientInfo.projectLocation}</div>
              {projectData.clientInfo.keyNotes && (
                <div><strong>Notes:</strong> {projectData.clientInfo.keyNotes}</div>
              )}
            </div>
          )}
        </Card>

        {/* Court Configuration */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Court Specifications</h3>
            <Checkbox
              checked={selectedSections.courtSpecs}
              onCheckedChange={() => toggleSection('courtSpecs')}
            />
          </div>
          {selectedSections.courtSpecs && (
            <div className="space-y-2 text-sm">
              <div><strong>Dimensions:</strong> {projectData.dimensions.length}' × {projectData.dimensions.width}'</div>
              <div><strong>Total Area:</strong> {projectData.dimensions.squareFootage} sq ft</div>
              {projectData.surfaceSystem.needsPressureWash && (
                <div>• Pressure wash surface preparation</div>
              )}
              {projectData.surfaceSystem.needsAcidWash && (
                <div>• Acid wash treatment</div>
              )}
              {projectData.surfaceSystem.patchWork.needed && (
                <div>• Patch work required ({projectData.surfaceSystem.patchWork.estimatedGallons} gallons)</div>
              )}
            </div>
          )}
        </Card>

        {/* Materials & Colors */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Materials & Colors</h3>
            <Checkbox
              checked={selectedSections.materials}
              onCheckedChange={() => toggleSection('materials')}
            />
          </div>
          {selectedSections.materials && (
            <div className="space-y-2 text-sm">
              <div><strong>Surface System:</strong></div>
              <div>• Acrylic Resurfacer</div>
              <div>• Color Coating System</div>
              {projectData.courtConfig.sports?.tennis?.selected && (
                <div>• Tennis Court Color: {projectData.courtConfig.sports.tennis.colors?.court}</div>
              )}
              {projectData.courtConfig.sports?.pickleball?.selected && (
                <>
                  <div>• Pickleball Kitchen: {projectData.courtConfig.sports.pickleball.colors?.kitchen}</div>
                  <div>• Pickleball Court: {projectData.courtConfig.sports.pickleball.colors?.court}</div>
                </>
              )}
            </div>
          )}
        </Card>

        {/* Equipment */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Equipment</h3>
            <Checkbox
              checked={selectedSections.equipment}
              onCheckedChange={() => toggleSection('equipment')}
            />
          </div>
          {selectedSections.equipment && (
            <div className="space-y-2 text-sm">
              {projectData.equipment.permanentTennisPoles > 0 && (
                <div>• {projectData.equipment.permanentTennisPoles} Tennis Net Post Sets</div>
              )}
              {projectData.equipment.permanentPickleballPoles > 0 && (
                <div>• {projectData.equipment.permanentPickleballPoles} Pickleball Net Post Sets</div>
              )}
              {projectData.equipment.mobilePickleballNets > 0 && (
                <div>• {projectData.equipment.mobilePickleballNets} Mobile Pickleball Nets</div>
              )}
              {projectData.equipment.basketballSystems?.length > 0 && (
                <div>• {projectData.equipment.basketballSystems.length} Basketball Systems</div>
              )}
            </div>
          )}
        </Card>

        {/* Logistics */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Project Logistics</h3>
            <Checkbox
              checked={selectedSections.logistics}
              onCheckedChange={() => toggleSection('logistics')}
            />
          </div>
          {selectedSections.logistics && (
            <div className="space-y-2 text-sm">
              <div><strong>Estimated Days:</strong> {projectData.logistics.estimatedDays}</div>
              <div><strong>Number of Trips:</strong> {projectData.logistics.numberOfTrips}</div>
              <div><strong>Travel Distance:</strong> {projectData.logistics.distanceToSite} miles</div>
              {projectData.logistics.logisticalNotes && (
                <div><strong>Notes:</strong> {projectData.logistics.logisticalNotes}</div>
              )}
            </div>
          )}
        </Card>

        {/* Pricing */}
        <Card className="p-4">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold">Pricing Details</h3>
            <Checkbox
              checked={selectedSections.pricing}
              onCheckedChange={() => toggleSection('pricing')}
            />
          </div>
          {selectedSections.pricing && (
            <div className="space-y-2 text-sm">
              <div><strong>Base Cost:</strong> {formatCurrency(projectData.baseCost || 0)}</div>
              <div><strong>Margin:</strong> {formatCurrency(projectData.margin || 0)}</div>
              <div><strong>Total Investment:</strong> {formatCurrency(projectData.totalCost || 0)}</div>
              <div><strong>Per Square Foot:</strong> {formatCurrency((projectData.totalCost || 0) / (projectData.dimensions.squareFootage || 1))}</div>
            </div>
          )}
        </Card>
        </div>

<div className="flex justify-end space-x-4">
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
    {generating ? 'Generating...' : 'Generate Professional Proposal'}
  </Button>
</div>
</div>
);
};