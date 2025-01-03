 
// pricing/components/MaterialsSection/ResurfacerSystem.jsx
import React from 'react';
import { formatCurrency } from '../../utils';

export const ResurfacerSystem = ({ data, globalPricing }) => {
  return (
    <div className="border-t border-gray-200 py-4">
      <h4 className="font-medium mb-2">Resurfacer Coating System</h4>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Gallons Required (2 coats):</span>
          <span>{data.actualGallons} gallons</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Drums Required (30 gal each):</span>
          <span>{data.drumsRequired} drums @ {formatCurrency((globalPricing?.materials?.acrylicResurfacer || 0) * 30)}/drum</span>
        </div>
        <div className="flex justify-between font-medium mt-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.cost)}</span>
        </div>
      </div>
    </div>
  );
};
