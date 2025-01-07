// src/components/estimator/sections/PricingSection/PricingSummary.jsx
import React from 'react';
import { formatCurrency } from '@/utils/formatting';

export const PricingSummary = ({ materialsCosts, laborCosts, dimensions }) => {
  const baseTotal = materialsCosts.total + laborCosts.total;
  const margin = baseTotal * 0.3;
  const totalCost = baseTotal + margin;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Project Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Cost:</span>
          <span>{formatCurrency(baseTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Margin (30%):</span>
          <span>{formatCurrency(margin)}</span>
        </div>

        <div className="pt-4 border-t mt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Base Project Total:</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {formatCurrency(totalCost / (dimensions?.squareFootage || 1))} per sq ft
          </div>
        </div>
      </div>
    </div>
  );
};