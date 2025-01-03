 
// src/components/estimator/sections/PricingSection/index.jsx
import React from 'react';
import { useMaterialsCosts } from '@/hooks/useMaterialsCosts';
import { useEquipmentCosts } from '@/hooks/useEquipmentCosts';
import { useLaborCosts } from '@/hooks/useLaborCosts';
import BaseCosts from './BaseCosts';
import EquipmentPackages from './EquipmentPackages';
import PricingSummary from './PricingSummary';

const PricingSection = ({ projectData, globalPricing }) => {
  const materialsCosts = useMaterialsCosts(projectData.surfaceSystem, projectData.dimensions, globalPricing);
  const equipmentCosts = useEquipmentCosts(projectData.equipment, globalPricing);
  const laborCosts = useLaborCosts(projectData.logistics, globalPricing);

  return (
    <div className="space-y-6">
      <BaseCosts
        materialsCosts={materialsCosts}
        laborCosts={laborCosts}
      />

      <EquipmentPackages
        equipmentCosts={equipmentCosts}
      />

      <PricingSummary
        materialsCosts={materialsCosts}
        laborCosts={laborCosts}
        dimensions={projectData.dimensions}
      />
    </div>
  );
};

// BaseCosts.jsx
const BaseCosts = ({ materialsCosts, laborCosts }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold mb-4">Base Project Costs</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaterialsBreakdown costs={materialsCosts} />
      <LaborBreakdown costs={laborCosts} />
    </div>
  </div>
);

// EquipmentPackages.jsx
const EquipmentPackages = ({ equipmentCosts }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold mb-4">Optional Equipment Packages</h3>

    {equipmentCosts.packages.map((pkg, index) => (
      <EquipmentPackage key={index} package={pkg} />
    ))}
  </div>
);

// MaterialsBreakdown.jsx
const MaterialsBreakdown = ({ costs }) => (
  <div className="space-y-2">
    <h4 className="font-medium">Materials</h4>
    {Object.entries(costs.subtotals).map(([key, value]) => (
      value > 0 && (
        <div key={key} className="flex justify-between text-sm">
          <span className="text-gray-600">{key}:</span>
          <span>{formatCurrency(value)}</span>
        </div>
      )
    ))}
    <div className="pt-2 border-t mt-2">
      <div className="flex justify-between font-medium">
        <span>Materials Total:</span>
        <span>{formatCurrency(costs.total)}</span>
      </div>
    </div>
  </div>
);

// LaborBreakdown.jsx
const LaborBreakdown = ({ costs }) => (
  <div className="space-y-2">
    <h4 className="font-medium">Labor & Travel</h4>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Labor:</span>
      <span>{formatCurrency(costs.labor.total)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Travel:</span>
      <span>{formatCurrency(costs.travel.cost)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Accommodations:</span>
      <span>{formatCurrency(costs.hotel.cost + costs.perDiem.cost)}</span>
    </div>
    <div className="pt-2 border-t mt-2">
      <div className="flex justify-between font-medium">
        <span>Labor Total:</span>
        <span>{formatCurrency(costs.total)}</span>
      </div>
    </div>
  </div>
);

// EquipmentPackage.jsx
const EquipmentPackage = ({ package: pkg }) => (
  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h4 className="font-medium text-blue-900 mb-2">{pkg.title}</h4>
    {pkg.items.map((item, index) => (
      <div key={index} className="flex justify-between text-sm">
        <span className="text-blue-800">{item.label}:</span>
        <span className="text-blue-900">{formatCurrency(item.cost)}</span>
      </div>
    ))}
    <div className="border-t border-blue-200 mt-2 pt-2">
      <div className="flex justify-between font-medium text-blue-900">
        <span>Package Total:</span>
        <span>{formatCurrency(pkg.total)}</span>
      </div>
    </div>
  </div>
);

// PricingSummary.jsx
const PricingSummary = ({ materialsCosts, laborCosts, dimensions }) => {
  const baseTotal = materialsCosts.total + laborCosts.total;
  const tax = baseTotal * 0.06;
  const margin = baseTotal * 0.3;
  const totalCost = baseTotal + tax + margin;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Project Summary</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Cost:</span>
          <span>{formatCurrency(baseTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sales Tax (6%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Margin (30%):</span>
          <span>{formatCurrency(margin)}</span>
        </div>

        <div className="pt-2 border-t mt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Base Project Total:</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            ${formatCurrency(totalCost / dimensions.squareFootage)} per sq ft
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
