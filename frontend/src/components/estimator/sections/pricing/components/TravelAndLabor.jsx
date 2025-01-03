// pricing/components/TravelAndLabor.jsx
import React from 'react';
import { formatCurrency } from '../utils';
import { useTravelCosts } from '../hooks/useTravelCosts';

export const TravelAndLabor = ({ projectData, globalPricing }) => {
  const travelCosts = useTravelCosts(projectData, globalPricing);
  const distanceToSite = projectData.clientInfo?.projectLocation?.mileage || 0;
  console.log('travelCosts:', travelCosts);


  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Travel & Labor</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Hotel ({travelCosts.hotel.days} days):</span>
          <span>{formatCurrency(travelCosts.hotel.cost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Mileage ({travelCosts.mileage.miles} miles):</span>
          <span>{formatCurrency(travelCosts.mileage.cost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">General Labor ({travelCosts.labor.hours} hours):</span>
          <span>{formatCurrency(travelCosts.labor.cost)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total Travel & Labor:</span>
            <span>{formatCurrency(travelCosts.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
