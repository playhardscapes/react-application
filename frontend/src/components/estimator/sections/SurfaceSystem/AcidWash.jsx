 
// src/components/estimator/sections/SurfaceSystem/SurfacePrep.jsx
import React from 'react';
import { formatCurrency } from '@/utils/formatting';

export const SurfacePrep = ({ data, onChange, dimensions, pricing }) => {
  const acidWashCost = data.needsAcidWash ?
    (dimensions?.squareFootage || 0) * (pricing?.services?.acidWash || 0) : 0;

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Surface Preparation</h4>

      <div className="space-y-2">
        <label className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.needsAcidWash}
              onChange={(e) => onChange('needsAcidWash', e.target.checked)}
              className="h-4 w-4"
            />
            <span>Acid Wash (New Concrete Only)</span>
          </div>
          {data.needsAcidWash && (
            <span className="text-sm text-gray-600">
              {formatCurrency(acidWashCost)}
            </span>
          )}
        </label>

        <label className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data.needsPressureWash}
            onChange={(e) => onChange('needsPressureWash', e.target.checked)}
            className="h-4 w-4"
          />
          <span>Pressure Wash</span>
        </label>
      </div>

      {data.needsAcidWash && (
        <div className="bg-blue-50 p-3 rounded text-sm">
          <p className="text-blue-800">
            Acid wash cost based on court size: {dimensions?.squareFootage || 0} sq ft
          </p>
          <p className="text-blue-600 mt-1">
            Rate: {formatCurrency(pricing?.services?.acidWash || 0)}/sq ft
          </p>
        </div>
      )}
    </div>
  );
};
