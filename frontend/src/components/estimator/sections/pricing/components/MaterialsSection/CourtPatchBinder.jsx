 
// pricing/components/MaterialsSection/CourtPatchBinder.jsx
import React from 'react';
import { formatCurrency } from '../../utils';

export const CourtPatchBinder = ({ data, globalPricing }) => {
  if (!data.gallons) return null;

  return (
    <div className="border-t border-gray-200 py-4">
      <h4 className="font-medium mb-2">Court Patch Binder System</h4>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Binder (5 gal):</span>
          <span>{data.gallons} gallons @ {formatCurrency(globalPricing?.materials?.cpb || 0)}/5gal</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sand (50 lb bags):</span>
          <span>{data.sandBags} bags @ {formatCurrency(globalPricing?.materials?.sand || 0)}/bag</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cement:</span>
          <span>{data.cementQuarts} quarts @ {formatCurrency(globalPricing?.materials?.cement || 0)}/48qt</span>
        </div>
        <div className="flex justify-between font-medium mt-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.cost)}</span>
        </div>
      </div>
    </div>
  );
};
