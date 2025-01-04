 
// src/components/estimator/sections/SurfaceSystem/SurfacePrep.jsx
import React from 'react';

export const SurfacePrep = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Surface Preparation</h4>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needsAcidWash}
        onChange={(e) => onChange('needsAcidWash', e.target.checked)}
        className="h-4 w-4"
      />
      <span>Acid Wash (New Concrete Only)</span>
    </label>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needsPressureWash}
        onChange={(e) => onChange('needsPressureWash', e.target.checked)}
        className="h-4 w-4"
      />
      <span>Pressure Wash</span>
    </label>
  </div>
);
