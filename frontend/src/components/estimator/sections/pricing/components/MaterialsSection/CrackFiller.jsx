// pricing/components/MaterialsSection/CrackFiller.jsx
import React from 'react';
import { formatCurrency } from '../../utils';

export const CrackFiller = ({ data, globalPricing }) => {
  // Add null check for data
  if (!data?.minorGallons && !data?.majorGallons) return null;

  return (
    <div className="border-t border-gray-200 py-4">
      <h4 className="font-medium mb-2">Crack Repair</h4>
      <div className="space-y-1">
        {data?.minorGallons > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Minor Cracks:</span>
            <span>{data.minorGallons} gal @ {formatCurrency(globalPricing?.materials?.minorCracks || 0)}/gal</span>
          </div>
        )}
        {data?.majorGallons > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Major Cracks:</span>
            <span>{data.majorGallons} gal @ {formatCurrency(globalPricing?.materials?.majorCracks || 0)}/gal</span>
          </div>
        )}
        <div className="flex justify-between font-medium mt-2">
          <span>Subtotal:</span>
          <span>{formatCurrency((data?.minorCost || 0) + (data?.majorCost || 0))}</span>
        </div>
      </div>
    </div>
  );
};
