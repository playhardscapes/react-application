 
// src/components/estimator/sections/PricingSection/EquipmentPackages.jsx
import React from 'react';
import { formatCurrency } from '@/utils/formatting';

const EquipmentPackage = ({ title, items }) => {
  const total = items.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-4">
      <h4 className="font-medium text-blue-900 mb-2">{title}</h4>
      {items.map((item, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-blue-800">{item.label}:</span>
          <span className="text-blue-900">{formatCurrency(item.cost)}</span>
        </div>
      ))}
      <div className="border-t border-blue-200 mt-2 pt-2">
        <div className="flex justify-between font-medium text-blue-900">
          <span>Package Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export const EquipmentPackages = ({ equipmentCosts }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold mb-4">Optional Equipment Packages</h3>

    {/* Tennis Package */}
    {equipmentCosts?.posts?.tennis?.equipment > 0 && (
      <EquipmentPackage
        title="Tennis Equipment Package"
        items={[
          {
            label: "Tennis Posts",
            cost: equipmentCosts.posts.tennis.equipment
          },
          {
            label: "Installation & Materials",
            cost: equipmentCosts.posts.tennis.installation
          }
        ]}
      />
    )}

    {/* Pickleball Package */}
    {(equipmentCosts?.posts?.pickleball?.equipment > 0) && (
      <EquipmentPackage
        title="Pickleball Equipment Package"
        items={[
          {
            label: "Permanent Posts",
            cost: equipmentCosts.posts.pickleball.equipment
          },
          {
            label: "Installation & Materials",
            cost: equipmentCosts.posts.pickleball.installation
          }
        ]}
      />
    )}

    {/* Windscreen Package */}
    {(equipmentCosts?.windscreen?.lowGrade?.cost > 0 ||
      equipmentCosts?.windscreen?.highGrade?.cost > 0) && (
      <EquipmentPackage
        title="Windscreen Package"
        items={[
          equipmentCosts.windscreen.lowGrade.cost > 0 && {
            label: `Low-Grade Windscreen (${equipmentCosts.windscreen.lowGrade.feet} ft)`,
            cost: equipmentCosts.windscreen.lowGrade.cost
          },
          equipmentCosts.windscreen.highGrade.cost > 0 && {
            label: `High-Grade Windscreen (${equipmentCosts.windscreen.highGrade.feet} ft)`,
            cost: equipmentCosts.windscreen.highGrade.cost
          }
        ].filter(Boolean)}
      />
    )}
  </div>
);
