
// pricing/components/MaterialsSection/LinePaintingSystem.jsx
import React from 'react';
import { formatCurrency } from '../../utils';

export const LinePaintingSystem = ({ projectData, globalPricing }) => {
  const courts = projectData.courtConfig?.sports || {};
  const services = globalPricing?.services || {};
  let totalCost = 0;

  // Tennis line costs
  const tennisCost = courts.tennis?.selected ?
    (courts.tennis.courtCount || 0) * (services.linePaintingTennis || 0) : 0;
  totalCost += tennisCost;

  // Pickleball line costs
  const pickleballCost = courts.pickleball?.selected ?
    (courts.pickleball.courtCount || 0) * (services.linePaintingPickleball || 0) : 0;
  totalCost += pickleballCost;

  // Basketball line costs
  const basketballCost = courts.basketball?.selected ?
    (courts.basketball.courtType === 'full' ?
      services.linePaintingFullBasketball : services.linePaintingHalfBasketball) || 0 : 0;
  totalCost += basketballCost;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Line Painting</h3>

      {courts.tennis?.selected && (
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-sm">
            <span>Tennis Courts ({courts.tennis.courtCount}):</span>
            <span>{formatCurrency(services.linePaintingTennis)} per court</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Tennis Lines:</span>
            <span>{formatCurrency(tennisCost)}</span>
          </div>
        </div>
      )}

      {courts.pickleball?.selected && (
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-sm">
            <span>Pickleball Courts ({courts.pickleball.courtCount}):</span>
            <span>{formatCurrency(services.linePaintingPickleball)} per court</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Pickleball Lines:</span>
            <span>{formatCurrency(pickleballCost)}</span>
          </div>
        </div>
      )}

      {courts.basketball?.selected && (
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-sm">
            <span>Basketball ({courts.basketball.courtType === 'full' ? 'Full' : 'Half'} Court):</span>
            <span>{formatCurrency(courts.basketball.courtType === 'full' ?
              services.linePaintingFullBasketball : services.linePaintingHalfBasketball)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Basketball Lines:</span>
            <span>{formatCurrency(basketballCost)}</span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between font-medium">
          <span>Total Line Painting Cost:</span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
      </div>
    </div>
  );
};
