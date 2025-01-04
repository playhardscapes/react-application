 
// src/components/estimator/sections/SurfaceSystem/PatchWork.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const PatchWork = ({ data, onChange }) => (
  <div className="space-y-3">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needed}
        onChange={(e) => onChange({ ...data, needed: e.target.checked })}
        className="h-4 w-4"
      />
      <span>Patch Work Required</span>
    </label>

    {data.needed && (
      <div className="pl-6 space-y-3">
        <NumberInput
          label="Estimated Patch Work (gallons)"
          value={data.estimatedGallons}
          onChange={(value) => onChange({ ...data, estimatedGallons: value })}
          min={0}
        />

        <NumberInput
          label="Minor Cracks (gallons)"
          value={data.minorCrackGallons}
          onChange={(value) => onChange({ ...data, minorCrackGallons: value })}
          min={0}
        />

        <NumberInput
          label="Major Cracks (gallons)"
          value={data.majorCrackGallons}
          onChange={(value) => onChange({ ...data, majorCrackGallons: value })}
          min={0}
        />
      </div>
    )}
  </div>
);
