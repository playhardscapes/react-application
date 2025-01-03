 
// pricing/components/MaterialsSection/FiberglassSystem.jsx
import React from 'react';
import { formatCurrency } from '../../utils';

export const FiberglassSystem = ({ data, globalPricing }) => {
  if (!data) return null;

  return (
    <div className="border-t border-gray-200 py-4">
      <h4 className="font-medium mb-2">Fiberglass System</h4>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Mesh ({data.area} sq ft):</span>
          <span>{data.rolls} rolls @ {formatCurrency(globalPricing?.materials?.fiberglassMesh || 0)}/roll</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Primer:</span>
          <span>{data.primerGallons} gal @ {formatCurrency(globalPricing?.materials?.fiberglassPrimer || 0)}/gal</span>
        </div>
        <div className="flex justify-between font-medium mt-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.cost)}</span>
        </div>
      </div>
    </div>
  );
};
