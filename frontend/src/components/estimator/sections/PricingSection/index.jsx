// src/components/estimator/sections/PricingSection/index.jsx
import React from 'react';
import { BaseCosts } from './BaseCosts';
import { EquipmentPackages } from './EquipmentPackages';
import { PricingSummary } from './PricingSummary';
import { useMaterialsCosts } from '@/hooks/useMaterialsCosts';
import { useEquipmentCosts } from '@/hooks/useEquipmentCosts';
import { useLaborCosts } from '@/hooks/useLaborCosts';

const PricingSection = ({ projectData, pricing }) => {
  const materialsCosts = useMaterialsCosts(projectData.surfaceSystem, projectData.dimensions, pricing);
  const equipmentCosts = useEquipmentCosts(projectData.equipment, pricing);
  const laborCosts = useLaborCosts(projectData.logistics, pricing);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Pricing</h3>

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

export default PricingSection;
