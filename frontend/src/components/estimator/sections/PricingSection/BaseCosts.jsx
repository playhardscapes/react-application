// src/components/estimator/sections/PricingSection/BaseCosts.jsx
import React from 'react';
import { MaterialsBreakdown } from './MaterialsBreakdown';
import { LaborBreakdown } from './LaborBreakdown';

export const BaseCosts = ({ materialsCosts, laborCosts }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold mb-4">Base Project Costs</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaterialsBreakdown costs={materialsCosts} />
      <LaborBreakdown costs={laborCosts} />
    </div>
  </div>
);
