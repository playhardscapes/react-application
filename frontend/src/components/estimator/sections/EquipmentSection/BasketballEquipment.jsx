 
// BasketballEquipment.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const BasketballSystems = ({ systems = [], onChange }) => {
  const addSystem = () => {
    onChange([...systems, {
      type: 'adjustable',
      extension: 4,
      mounted: 'ground'
    }]);
  };

  const updateSystem = (index, field, value) => {
    const updatedSystems = [...systems];
    updatedSystems[index] = {
      ...updatedSystems[index],
      [field]: value
    };
    onChange(updatedSystems);
  };

  const removeSystem = (index) => {
    onChange(systems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Basketball Systems</h4>
        <button
          onClick={addSystem}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add System
        </button>
      </div>

      {systems.map((system, index) => (
        <div key={index} className="border p-4 rounded space-y-3">
          <div className="flex justify-between">
            <h5 className="font-medium">System {index + 1}</h5>
            <button
              onClick={() => removeSystem(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={system.type}
                onChange={(e) => updateSystem(index, 'type', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="adjustable">Adjustable Height</option>
                <option value="fixed">Fixed Height</option>
              </select>
            </div>

            <NumberInput
              label="Extension Length (ft)"
              value={system.extension}
              onChange={(value) => updateSystem(index, 'extension', value)}
              min={4}
              max={8}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Mounting</label>
              <select
                value={system.mounted}
                onChange={(e) => updateSystem(index, 'mounted', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ground">Ground Mount</option>
                <option value="wall">Wall Mount</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
