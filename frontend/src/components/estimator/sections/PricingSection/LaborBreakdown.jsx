// src/components/estimator/sections/PricingSection/LaborBreakdown.jsx
import React from 'react';
import { formatCurrency } from '@/utils/formatting';

export const LaborBreakdown = ({ costs }) => {
  return (
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
        <span className="text-gray-600">Hotel:</span>
        <span>{formatCurrency(costs?.hotel?.cost || 0)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Per Diem ({costs?.perDiem?.crew || 2} person crew):</span>
        <span>{formatCurrency(costs?.perDiem?.cost || 0)}</span>
      </div>
      
      <div className="pt-2 border-t mt-2">
        <div className="flex justify-between font-medium">
          <span>Labor Total:</span>
          <span>{formatCurrency(costs?.total || 0)}</span>
        </div>
        {costs?.travel?.totalMiles > 0 && (
          <div className="text-sm text-gray-600 mt-1">
            Total Travel: {Math.round(costs.travel.totalMiles)} miles
            ({costs?.details?.numberOfTrips || 1} trips)
          </div>
        )}
        {costs?.perDiem?.days > 0 && (
          <div className="text-sm text-gray-600">
            Per Diem: {costs.perDiem.days} days @ ${50}/person/day
          </div>
        )}
      </div>
    </div>
  );
};