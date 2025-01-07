// src/components/estimator/sections/PricingSection/ColorSummary.jsx
import React from 'react';
import { formatCurrency } from '@/utils/formatting';

export const ColorSummary = ({ projectData, colorCalculations }) => {
  const { courtConfig } = projectData;

  const formatGallons = (gallons) => {
    if (!gallons) return '0 gallons (0 drums)';
    return `${Math.ceil(gallons)} gallons (${Math.ceil(gallons / 30)} drums)`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Color & Materials Summary</h3>
      
      <div className="space-y-6">
        {/* Resurfacer Section */}
        <div className="space-y-2">
          <h4 className="font-medium">Acrylic Resurfacer</h4>
          <div className="flex justify-between text-sm">
            <span>Total Required:</span>
            <span>{formatGallons(colorCalculations?.resurfacer?.gallonsNeeded || 0)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Cost:</span>
            <span>{formatCurrency(colorCalculations?.resurfacer?.cost || 0)}</span>
          </div>
        </div>

        {/* Color Coatings */}
        <div className="space-y-2">
          <h4 className="font-medium">Color Coatings</h4>
          
          {/* Tennis Courts */}
          {courtConfig.sports?.tennis?.selected && (
            <div className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-sm">
                Tennis Courts ({courtConfig.sports.tennis.courtCount || 1})
              </div>
              <div className="flex justify-between text-sm">
                <span>{courtConfig.sports.tennis.colors?.court}:</span>
                <span>{formatGallons(colorCalculations?.tennis?.gallonsNeeded || 0)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Area: {colorCalculations?.tennis?.area || 0} sq ft
              </div>
            </div>
          )}
          
          {/* Pickleball Courts */}
          {courtConfig.sports?.pickleball?.selected && (
            <div className="bg-gray-50 p-2 rounded mt-2">
              <div className="font-medium text-sm">
                Pickleball Courts ({courtConfig.sports.pickleball.courtCount || 1})
              </div>
              <div className="flex justify-between text-sm">
                <span>Kitchen ({courtConfig.sports.pickleball.colors?.kitchen}):</span>
                <span>{formatGallons(colorCalculations?.pickleball?.kitchen?.gallonsNeeded || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Court ({courtConfig.sports.pickleball.colors?.court}):</span>
                <span>{formatGallons(colorCalculations?.pickleball?.court?.gallonsNeeded || 0)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Total Area: {
                  (colorCalculations?.pickleball?.kitchen?.area || 0) + 
                  (colorCalculations?.pickleball?.court?.area || 0)
                } sq ft
              </div>
            </div>
          )}
          
          {/* Basketball Court */}
          {courtConfig.sports?.basketball?.selected && (
            <div className="bg-gray-50 p-2 rounded mt-2">
              <div className="font-medium text-sm">
                Basketball Court ({courtConfig.sports.basketball.courtType || 'half'})
              </div>
              <div className="flex justify-between text-sm">
                <span>{courtConfig.sports.basketball.colors?.court}:</span>
                <span>{formatGallons(colorCalculations?.basketball?.gallonsNeeded || 0)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Area: {colorCalculations?.basketball?.area || 0} sq ft
              </div>
            </div>
          )}

          {/* Apron */}
          {courtConfig.apron?.color && (
            <div className="bg-gray-50 p-2 rounded mt-2">
              <div className="font-medium text-sm">Apron Area</div>
              <div className="flex justify-between text-sm">
                <span>{courtConfig.apron.color}:</span>
                <span>{formatGallons(colorCalculations?.apron?.gallonsNeeded || 0)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Area: {colorCalculations?.apron?.area || 0} sq ft
              </div>
            </div>
          )}
        </div>

        {/* Purchase Order Summary */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Purchase Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Resurfacer Required:</span>
              <span>{Math.ceil((colorCalculations?.resurfacer?.gallonsNeeded || 0) / 30)} drums</span>
            </div>
            {Object.entries(colorCalculations?.colorTotals || {}).map(([color, gallons]) => (
              <div key={color} className="flex justify-between text-sm">
                <span>{color} Required:</span>
                <span>{Math.ceil(gallons / 30)} drums</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSummary;