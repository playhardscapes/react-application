 
// src/components/estimator/sections/CourtConfiguration/TennisCourt.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';
import { ColorSelect } from './ColorSelect';

export const TennisCourt = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <label className="flex items-center space-x-2 mb-3">
      <input
        type="checkbox"
        checked={data.selected || false}
        onChange={(e) => onChange({ ...data, selected: e.target.checked })}
        className="h-4 w-4"
      />
      <span className="font-medium">Tennis</span>
    </label>

    {data.selected && (
      <div className="space-y-3">
        <NumberInput
          label="Number of Courts"
          value={data.courtCount || ''}
          onChange={(value) => onChange({ ...data, courtCount: value })}
          min={1}
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
    )}
  </div>
);
