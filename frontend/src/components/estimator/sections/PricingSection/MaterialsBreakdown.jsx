// src/components/estimator/sections/PricingSection/MaterialsBreakdown.jsx
import React from 'react';
import { formatCurrency } from '@/utils/formatting';

export const MaterialsBreakdown = ({ costs }) => (
  <div className="space-y-2">
    <h4 className="font-medium">Materials</h4>
    {costs?.subtotals && Object.entries(costs.subtotals).map(([key, value]) => (
      value > 0 && (
        <div key={key} className="flex justify-between text-sm">
          <span className="text-gray-600">
            {key.charAt(0).toUpperCase() + key.slice(1)}:
          </span>
          <span>{formatCurrency(value)}</span>
        </div>
      )
    ))}
    <div className="pt-2 border-t mt-2">
      <div className="flex justify-between font-medium">
        <span>Materials Total:</span>
        <span>{formatCurrency(costs?.total || 0)}</span>
      </div>
    </div>
  </div>
);
