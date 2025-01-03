// src/components/estimator/sections/ProjectBasics.jsx
import React, { useState } from 'react';
import { FormInput, NumberInput } from '../../common/FormInput';

const SUBSTRATE_TYPES = [
  { value: 'new-concrete', label: 'New Concrete' },
  { value: 'existing-concrete', label: 'Existing Concrete' },
  { value: 'asphalt', label: 'Asphalt' }
];

const ProjectBasics = ({ data, onChange }) => {
  const [errors, setErrors] = useState({});

  const validate = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'type':
        if (!value) {
          newErrors.type = 'Please select a substrate type';
        } else {
          delete newErrors.type;
        }
        break;
      case 'length':
      case 'width':
        if (value <= 0) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be greater than 0`;
        } else {
          delete newErrors[field];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateDimensions = (length, width) => {
    const updatedDimensions = {
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      squareFootage: (parseFloat(length) || 0) * (parseFloat(width) || 0)
    };

    onChange({
      ...data,
      dimensions: updatedDimensions
    });
  };

  const handleDimensionChange = (field, value) => {
    const isValid = validate(field, value);
    const length = field === 'length' ? value : data.dimensions?.length || 0;
    const width = field === 'width' ? value : data.dimensions?.width || 0;

    if (isValid) {
      updateDimensions(length, width);
    }
  };

  const handleSubstrateChange = (type) => {
    const isValid = validate('type', type);
    onChange({
      ...data,
      type,
      isValid
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Basics</h3>

      <div>
        <label className="block text-sm font-medium mb-2">Substrate Type</label>
        <select
          value={data.type || ''}
          onChange={(e) => handleSubstrateChange(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select substrate type...</option>
          {SUBSTRATE_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-500">{errors.type}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput
          label="Length (ft)"
          value={data.dimensions?.length || ''}
          onChange={(value) => handleDimensionChange('length', value)}
          min={0}
          error={errors.length}
          required
        />

        <NumberInput
          label="Width (ft)"
          value={data.dimensions?.width || ''}
          onChange={(value) => handleDimensionChange('width', value)}
          min={0}
          error={errors.width}
          required
        />

        <div className="md:col-span-2">
          <NumberInput
            label="Square Footage"
            value={data.dimensions?.squareFootage || ''}
            disabled
            className="bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">
            Auto-calculated based on length and width
          </p>
        </div>
      </div>

      <div>
        <FormInput
          label="Site Notes"
          value={data.notes || ''}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          type="textarea"
          placeholder="Any special considerations about the site or dimensions..."
          className="h-24"
        />
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">Please fix the following errors:</p>
          <ul className="list-disc list-inside">
            {Object.values(errors).map((error, index) => (
              <li key={index} className="text-red-600 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectBasics;
