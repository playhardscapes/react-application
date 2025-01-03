 
// src/components/estimator/sections/ProjectBasics/index.jsx
import React from 'react';
import SubstrateSelect from './SubstrateSelect';
import DimensionsInput from './DimensionsInput';
import ProjectNotes from './ProjectNotes';
import { useProjectCalculations } from './useProjectCalculations';

const ProjectBasics = ({ data, onChange }) => {
  const { squareFootage } = useProjectCalculations(data);

  const updateField = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Basics</h3>

      <SubstrateSelect
        value={data.type}
        onChange={(value) => updateField('type', value)}
      />

      <DimensionsInput
        dimensions={data.dimensions}
        onChange={(dims) => updateField('dimensions', dims)}
        squareFootage={squareFootage}
      />

      <ProjectNotes
        notes={data.notes}
        onChange={(value) => updateField('notes', value)}
      />
    </div>
  );
};

// SubstrateSelect.jsx
const SUBSTRATE_TYPES = [
  { value: 'new-concrete', label: 'New Concrete' },
  { value: 'existing-concrete', label: 'Existing Concrete' },
  { value: 'asphalt', label: 'Asphalt' }
];

const SubstrateSelect = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-2">Substrate Type</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">Select substrate type...</option>
      {SUBSTRATE_TYPES.map(type => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  </div>
);

// DimensionsInput.jsx
const DimensionsInput = ({ dimensions = {}, onChange, squareFootage }) => {
  const updateDimension = (field, value) => {
    const newDimensions = {
      ...dimensions,
      [field]: value,
      squareFootage: field === 'length' ?
        value * (dimensions.width || 0) :
        (dimensions.length || 0) * value
    };
    onChange(newDimensions);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput
          label="Length (ft)"
          value={dimensions.length}
          onChange={(value) => updateDimension('length', value)}
          min={0}
        />

        <NumberInput
          label="Width (ft)"
          value={dimensions.width}
          onChange={(value) => updateDimension('width', value)}
          min={0}
        />
      </div>

      <div>
        <NumberInput
          label="Square Footage"
          value={squareFootage}
          disabled
          className="bg-gray-50"
        />
        <p className="mt-1 text-sm text-gray-500">
          Auto-calculated based on length and width
        </p>
      </div>
    </div>
  );
};

// ProjectNotes.jsx
const ProjectNotes = ({ notes, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">Project Notes</label>
    <textarea
      value={notes || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded h-24"
      placeholder="Special considerations, site conditions, or requirements..."
    />
  </div>
);

// useProjectCalculations.js
export const useProjectCalculations = (data) => {
  const length = data.dimensions?.length || 0;
  const width = data.dimensions?.width || 0;
  const squareFootage = length * width;

  return {
    squareFootage
  };
};

export default ProjectBasics;
