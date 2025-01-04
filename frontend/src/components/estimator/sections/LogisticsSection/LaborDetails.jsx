 
// src/components/estimator/sections/LogisticsSection/LaborDetails.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const LaborDetails = ({ data, totalLaborHours, onChange }) => (
  <div className="space-y-4">
    <h4 className="font-medium">Labor Details</h4>

    <NumberInput
      label="Additional Labor Hours"
      value={data.generalLaborHours}
      onChange={(value) => onChange('generalLaborHours', value)}
      min={0}
      helperText="Beyond standard work days"
    />

    <div className="bg-gray-50 p-3 rounded">
      <p className="text-sm font-medium">Total Labor: {totalLaborHours} hours</p>
      <p className="text-sm text-gray-600 mt-1">
        Includes standard days plus additional labor
      </p>
    </div>
  </div>
);
