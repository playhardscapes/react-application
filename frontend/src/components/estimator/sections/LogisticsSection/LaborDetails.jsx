// src/components/estimator/sections/LogisticsSection/LaborDetails.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const LaborDetails = ({ data, onChange }) => {
  const totalLaborHours = ((data.estimatedDays || 0) * 8) + (data.generalLaborHours || 0);

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Labor Details</h4>

      <NumberInput
        label="Additional Labor Hours"
        value={data.generalLaborHours || 0}
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

      {data.distanceToSite > 0 && (
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-blue-800">
            Travel Distance: {Math.round(data.distanceToSite)} miles
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Round trip: {Math.round(data.distanceToSite * 2)} miles
          </p>
        </div>
      )}
    </div>
  );
};

