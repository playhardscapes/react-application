
// src/components/estimator/sections/PricingSection/LaborBreakdown.jsx
import React from 'react';
import { formatCurrency } from '@/utils/formatting';

export const LaborBreakdown = ({ costs }) => (
  <div className="space-y-2">
    <h4 className="font-medium">Labor & Travel</h4>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Labor:</span>
      <span>{formatCurrency(costs?.labor?.total || 0)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Travel:</span>
      <span>{formatCurrency(costs?.travel?.cost || 0)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Accommodations:</span>
      <span>{formatCurrency((costs?.hotel?.cost || 0) + (costs?.perDiem?.cost || 0))}</span>
    </div>
    <div className="pt-2 border-t mt-2">
      <div className="flex justify-between font-medium">
        <span>Labor Total:</span>
        <span>{formatCurrency(costs?.total || 0)}</span>
      </div>
    </div>
  </div>
   );

