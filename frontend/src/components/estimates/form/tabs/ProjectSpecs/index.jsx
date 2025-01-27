// src/components/estimator/EstimationForm/tabs/ProjectSpecs/index.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';

const ProjectSpecs = ({ data, onChange }) => {
  const handleDimensionChange = (field, value) => {
    const length = field === 'length' ? value : (data.length || 0);
    const width = field === 'width' ? value : (data.width || 0);
    
    onChange({
      ...data,
      [field]: value,
      square_footage: length * width
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Project Specifications</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput
            label="Length (ft)"
            value={data.length || 0}
            onChange={(value) => handleDimensionChange('length', value)}
            min={0}
          />

          <NumberInput
            label="Width (ft)"
            value={data.width || 0}
            onChange={(value) => handleDimensionChange('width', value)}
            min={0}
          />

          <div className="md:col-span-2">
            <NumberInput
              label="Total Square Footage"
              value={data.square_footage || 0}
              disabled
              helperText={data.length && data.width ? 
                `${data.length}' × ${data.width}' = ${data.square_footage} sq ft` : 
                'Auto-calculated from length and width'}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectSpecs;