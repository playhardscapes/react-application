// src/components/estimator/sections/EquipmentSection/BasketballEquipment.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';
import { Select } from '@/components/ui/select';

export const BasketballSystems = ({ systems = [], onChange, error }) => {
  // Ensure systems is always an array
  const currentSystems = Array.isArray(systems) ? systems : [];

  const addSystem = () => {
    onChange([...currentSystems, {
      type: 'adjustable',
      extension: 4,
      mounted: 'ground'
    }]);
  };

  const updateSystem = (index, field, value) => {
    const updatedSystems = [...currentSystems];
    updatedSystems[index] = {
      ...updatedSystems[index],
      [field]: field === 'extension' ? Number(value) : value
    };
    onChange(updatedSystems);
  };

  const removeSystem = (index) => {
    onChange(currentSystems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Basketball Systems</h4>
        <button
          onClick={addSystem}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          type="button"
        >
          Add System
        </button>
      </div>

      {currentSystems.map((system, index) => (
        <div key={index} className="border p-4 rounded space-y-3">
          <div className="flex justify-between">
            <div className="flex-1">
              <Select
                label="System Type"
                value={system.type}
                onChange={(value) => updateSystem(index, 'type', value)}
                options={[
                  { value: 'adjustable', label: 'Adjustable' },
                  { value: 'fixed', label: 'Fixed' }
                ]}
              />
            </div>
            <button
              onClick={() => removeSystem(index)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Mounting Type"
              value={system.mounted}
              onChange={(value) => updateSystem(index, 'mounted', value)}
              options={[
                { value: 'ground', label: 'Ground Mount' },
                { value: 'wall', label: 'Wall Mount' }
              ]}
            />
            <NumberInput
              label="Extension (ft)"
              value={system.extension}
              onChange={(value) => updateSystem(index, 'extension', value)}
              min={4}
              max={8}
              error={error?.extension}
            />
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
