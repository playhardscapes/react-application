 
// src/components/estimator/sections/SurfaceSystem/CushionSystem.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const CushionSystem = ({ data, squareFootage, onChange }) => (
  <div className="space-y-3">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needed}
        onChange={(e) => onChange({ ...data, needed: e.target.checked })}
        className="h-4 w-4"
      />
      <span>Cushion System</span>
    </label>

    {data.needed && (
      <div className="pl-6">
        <NumberInput
          label="Cushion Area (sq ft)"
          value={data.area}
          onChange={(value) => onChange({ ...data, area: value })}
          min={0}
          max={squareFootage}
          helperText={`Maximum area: ${squareFootage} sq ft`}
        />
      </div>
    )}
  </div>
);
