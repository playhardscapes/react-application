// src/components/estimator/sections/SurfaceSystem/PatchWork.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const PatchWork = ({ data, onChange, errors }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Patch Work</h4>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needed || false}
        onChange={(e) => onChange({
          ...data,
          needed: e.target.checked,
          estimatedGallons: e.target.checked ? data.estimatedGallons : 0,
          minorCrackGallons: e.target.checked ? data.minorCrackGallons : 0,
          majorCrackGallons: e.target.checked ? data.majorCrackGallons : 0
        })}
        className="h-4 w-4"
      />
      <span>Patch Work Required</span>
    </label>

    {data.needed && (
      <div className="pl-6 space-y-3">
        <NumberInput
          label="Estimated Patch Work (gallons)"
          value={data.estimatedGallons || 0}
          onChange={(value) => onChange({ ...data, estimatedGallons: value })}
          min={0}
          error={errors?.patch_work_gallons}
        />

        <NumberInput
          label="Minor Cracks (gallons)"
          value={data.minorCrackGallons || 0}
          onChange={(value) => onChange({ ...data, minorCrackGallons: value })}
          min={0}
          error={errors?.minor_crack_gallons}
        />

        <NumberInput
          label="Major Cracks (gallons)"
          value={data.majorCrackGallons || 0}
          onChange={(value) => onChange({ ...data, majorCrackGallons: value })}
          min={0}
          error={errors?.major_crack_gallons}
        />
      </div>
    )}
  </div>
);
