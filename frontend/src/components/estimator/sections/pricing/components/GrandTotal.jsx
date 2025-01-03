// components/GrandTotal.jsx
import React from 'react';
import { formatCurrency } from '../utils';

export const GrandTotal = ({
  materialTotal,
  linePaintingCost,
  travelTotal,
  equipmentTotal
}) => {
  const grandTotal = materialTotal + linePaintingCost + travelTotal + equipmentTotal;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Project Total</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Materials:</span>
          <span>{formatCurrency(materialTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Line Painting:</span>
          <span>{formatCurrency(linePaintingCost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Travel & Labor:</span>
          <span>{formatCurrency(travelTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Equipment:</span>
          <span>{formatCurrency(equipmentTotal)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between font-semibold text-lg">
            <span>Grand Total:</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrandTotal;
