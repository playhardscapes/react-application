 
// src/components/estimator/sections/CourtConfiguration/PickleballCourt.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';
import { ColorSelect } from './ColorSelect';

export const PickleballCourt = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <label className="flex items-center space-x-2 mb-3">
      <input
        type="checkbox"
        checked={data.selected || false}
        onChange={(e) => onChange({ ...data, selected: e.target.checked })}
        className="h-4 w-4"
      />
      <span className="font-medium">Pickleball</span>
    </label>

    {data.selected && (
      <div className="space-y-3">
        <NumberInput
          label="Number of Courts"
          value={data.courtCount || ''}
          onChange={(value) => onChange({ ...data, courtCount: value })}
          min={1}
        />
        <div className="grid grid-cols-2 gap-4">
          <ColorSelect
            label="Kitchen Color"
            value={data?.colors?.kitchen}
            onChange={(color) => onChange({
              ...data,
              colors: { ...data.colors, kitchen: color }
            })}
          />
          <ColorSelect
            label="Court Color"
            value={data?.colors?.court}
            onChange={(color) => onChange({
              ...data,
              colors: { ...data.colors, court: color }
            })}
          />
        </div>
      </div>
    )}
  </div>
);
