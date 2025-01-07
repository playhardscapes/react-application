// src/components/estimator/sections/ProjectBasics.jsx
import React, { useState, useEffect } from 'react';
import { NumberInput } from '@/components/ui/number-input';

const ProjectBasics = ({ data, onChange }) => {
  // Update dimensions and calculate square footage
  const handleDimensionChange = (field, value) => {
    const length = field === 'length' ? value : (data.length || 0);
    const width = field === 'width' ? value : (data.width || 0);
    const squareFootage = length * width;

    onChange({
      length,
      width,
      squareFootage
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Basics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput
          label="Length (ft)"
          value={data.length || ''}
          onChange={(value) => handleDimensionChange('length', value)}
          min={0}
        />

        <NumberInput
          label="Width (ft)"
          value={data.width || ''}
          onChange={(value) => handleDimensionChange('width', value)}
          min={0}
        />

        <div className="md:col-span-2">
          <NumberInput
            label="Square Footage"
            value={data.squareFootage || ''}
            disabled
            className="bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">
            Auto-calculated based on length and width
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectBasics;