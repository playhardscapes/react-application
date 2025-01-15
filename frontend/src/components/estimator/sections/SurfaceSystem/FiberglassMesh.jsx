// src/components/estimator/sections/SurfaceSystem/FiberglassMesh.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const FiberglassMesh = ({ data = {}, maxArea = 0, onChange, errors = {} }) => {
  const handleAreaChange = (value) => {
    // Ensure area doesn't exceed maxArea
    const area = Math.min(Number(value) || 0, maxArea);
    onChange({
      ...data,
      needed: true,
      area
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Fiberglass Mesh System</h4>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={data.needed || false}
          onChange={(e) => onChange({
            ...data,
            needed: e.target.checked,
            area: e.target.checked ? data.area || 0 : 0
          })}
          className="h-4 w-4"
        />
        <span>Apply Fiberglass Mesh</span>
      </label>

      {data.needed && (
        <div className="pl-6 space-y-2">
          <NumberInput
            label="Mesh Area (sq ft)"
            value={data.area || 0}
            onChange={handleAreaChange}
            min={0}
            max={maxArea}
            error={errors?.fiberglass_mesh_area}
          />
          {maxArea > 0 && (
            <p className="text-sm text-gray-500">
              Maximum area available: {maxArea.toLocaleString()} sq ft
            </p>
          )}
          {errors?.fiberglass_mesh_area && (
            <p className="text-sm text-red-500">{errors.fiberglass_mesh_area}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FiberglassMesh;
