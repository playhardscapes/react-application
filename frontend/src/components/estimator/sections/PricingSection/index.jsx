// src/components/estimator/sections/PricingSection/index.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatting';
import { useMaterialsCosts } from '@/hooks/useMaterialsCosts';
import { useEquipmentCosts } from '@/hooks/useEquipmentCosts';
import { useLaborCosts } from '@/hooks/useLaborCosts';

const CostSection = ({ title, items = [], total }) => (
  <Card className="p-4">
    <h4 className="font-medium text-lg mb-3">{title}</h4>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-gray-600">{item.label}</span>
          <span>{item.cost > 0 ? formatCurrency(item.cost) : '-'}</span>
        </div>
      ))}
      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between font-medium">
          <span>Total {title}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  </Card>
);

const PricingSection = ({ estimateData, pricing }) => {
  const materialsCosts = useMaterialsCosts(estimateData, pricing);
  const equipmentCosts = useEquipmentCosts(estimateData, pricing);
  const laborCosts = useLaborCosts(estimateData, pricing);

  // Equipment cost items
  const equipmentItems = [
  {
    label: 'Tennis Posts',
    cost: equipmentCosts.posts?.tennis?.total || 0
  },
  {
    label: 'Pickleball Equipment',
    cost: (equipmentCosts.posts?.pickleball?.total || 0) +
          (equipmentCosts.posts?.mobilePickleball?.total || 0)
  },
  {
    label: 'Windscreen',
    cost: (equipmentCosts.windscreen?.lowGrade?.total || 0) +
          (equipmentCosts.windscreen?.highGrade?.total || 0)
  },
  {
    label: 'Basketball Systems',
    cost: equipmentCosts.basketball?.total || 0
  }
].filter(item => item.cost > 0); // Only show items with costs

  // Material cost items
  const materialItems = [
    {
      label: 'Surface Preparation',
      cost: (materialsCosts.subtotals?.acidWash || 0)
    },
    {
      label: 'Patch Work',
      cost: (materialsCosts.subtotals?.patchWork || 0)
    },
    {
      label: 'Resurfacer & Coating',
      cost: (materialsCosts.subtotals?.resurfacer || 0) +
            (materialsCosts.subtotals?.colorCoating || 0)
    }
  ];

  // Labor cost items
  const laborItems = [
    { label: 'Base Labor', cost: laborCosts.labor?.total || 0 },
    { label: 'Travel Expenses', cost: laborCosts.travel?.cost || 0 },
    { label: 'Hotel Accommodations', cost: laborCosts.hotel?.cost || 0 },
    { label: 'Per Diem', cost: laborCosts.perDiem?.cost || 0 }
  ];

  // Calculate totals
  const baseSubtotal = materialsCosts.total + laborCosts.total;
  const margin = baseSubtotal * 0.3;
  const totalCost = baseSubtotal + margin + (equipmentCosts.total || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CostSection
          title="Materials"
          items={materialItems}
          total={materialsCosts.total}
        />
        <CostSection
          title="Labor"
          items={laborItems}
          total={laborCosts.total}
        />
      </div>

      {equipmentCosts.total > 0 && (
        <CostSection
          title="Optional Equipment"
          items={equipmentItems}
          total={equipmentCosts.total || 0}
        />
      )}

      <Card className="p-4">
        <h4 className="font-medium text-lg mb-3">Project Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Cost</span>
            <span>{formatCurrency(baseSubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Margin (30%)</span>
            <span>{formatCurrency(margin)}</span>
          </div>
          {equipmentCosts.total > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Optional Equipment</span>
              <span>{formatCurrency(equipmentCosts.total)}</span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Project Cost</span>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            {estimateData.square_footage > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                Cost per sq ft: {formatCurrency(totalCost / estimateData.square_footage)}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PricingSection;
