 
// src/components/estimator/sections/SurfaceSystem/SurfacePrep.jsx
import React from 'react';

export const SurfacePrep = ({ data, onChange, errors }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Surface Preparation</h4>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needs_acid_wash || false}
        onChange={(e) => onChange('acid_wash', e.target.checked)}
        className="h-4 w-4"
      />
      <span>Acid Wash (New Concrete Only)</span>
    </label>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needs_pressure_wash || false}
        onChange={(e) => onChange('pressure_wash', e.target.checked)}
        className="h-4 w-4"
      />
      <span>Pressure Wash</span>
    </label>
  </div>
 );


export default SurfacePrep;
