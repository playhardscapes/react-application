 
// src/components/pricing/EquipmentPricingDisplay.jsx
import React from 'react';
import { useEquipmentCosts } from '../../hooks/useEquipmentCosts';
import { formatCurrency } from '../../utils/formatting';

const CostRow = ({ label, equipment = 0, installation = 0, holes = 0, concrete = 0 }) => {
  const total = equipment + installation + holes + concrete;

  return (
    <div className="py-2">
      <div className="flex justify-between font-medium mb-1">
        <span>{label}</span>
        <span>{formatCurrency(total)}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
        {equipment > 0 && (
          <span>Equipment: {formatCurrency(equipment)}</span>
        )}
        {installation > 0 && (
          <span>Installation: {formatCurrency(installation)}</span>
        )}
        {holes > 0 && (
          <span>Hole Cutting: {formatCurrency(holes)}</span>
        )}
        {concrete > 0 && (
          <span>Concrete: {formatCurrency(concrete)}</span>
        )}
      </div>
    </div>
  );
};

const EquipmentPricingDisplay = ({ equipmentData }) => {
  const costs = useEquipmentCosts(equipmentData);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Equipment Costs</h3>

      {/* Tennis Posts */}
      {costs.posts.tennis.equipment > 0 && (
        <CostRow
          label="Tennis Posts"
          equipment={costs.posts.tennis.equipment}
          installation={costs.posts.tennis.installation}
          holes={costs.posts.tennis.holes}
          concrete={costs.posts.tennis.concrete}
        />
      )}

      {/* Pickleball Equipment */}
      {(costs.posts.pickleball.equipment > 0 || costs.posts.mobilePickleball.equipment > 0) && (
        <div className="border-t border-gray-200">
          <CostRow
            label="Pickleball Equipment"
            equipment={costs.posts.pickleball.equipment + costs.posts.mobilePickleball.equipment}
            installation={costs.posts.pickleball.installation}
            holes={costs.posts.pickleball.holes}
            concrete={costs.posts.pickleball.concrete}
          />
        </div>
      )}

      {/* Basketball Systems */}
      {costs.basketball.length > 0 && (
        <div className="border-t border-gray-200">
          <h4 className="font-medium mt-2 mb-1">Basketball Systems</h4>
          {costs.basketball.map((system, index) => (
            <CostRow
              key={index}
              label={`System ${index + 1}`}
              equipment={system.equipment}
              installation={system.installation}
              holes={system.holes}
              concrete={system.concrete}
            />
          ))}
        </div>
      )}

      {/* Windscreen */}
      {(costs.windscreen.lowGrade.equipment > 0 || costs.windscreen.highGrade.equipment > 0) && (
        <div className="border-t border-gray-200">
          <h4 className="font-medium mt-2 mb-1">Windscreen</h4>
          {costs.windscreen.lowGrade.equipment > 0 && (
            <CostRow
              label="Low-Grade Windscreen"
              equipment={costs.windscreen.lowGrade.equipment}
              installation={costs.windscreen.lowGrade.installation}
            />
          )}
          {costs.windscreen.highGrade.equipment > 0 && (
            <CostRow
              label="High-Grade Windscreen"
              equipment={costs.windscreen.highGrade.equipment}
              installation={costs.windscreen.highGrade.installation}
            />
          )}
        </div>
      )}

      {/* Installation Summary */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <h4 className="font-medium">Installation Details</h4>
        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
          <div>
            <span className="text-gray-600">Total Holes Required:</span>
            <span className="ml-2 font-medium">{costs.details.totalHoles}</span>
          </div>
          <div>
            <span className="text-gray-600">Installation Hours:</span>
            <span className="ml-2 font-medium">{costs.details.totalInstallationHours.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">Equipment Total:</span>
            <span className="ml-2 font-medium">{formatCurrency(costs.totals.equipment)}</span>
          </div>
          <div>
            <span className="text-gray-600">Installation Total:</span>
            <span className="ml-2 font-medium">{formatCurrency(costs.totals.installation)}</span>
          </div>
        </div>
        <div className="mt-4 text-lg font-semibold flex justify-between">
          <span>Grand Total:</span>
          <span>{formatCurrency(costs.totals.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPricingDisplay;
