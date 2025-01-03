// src/components/estimator/sections/LogisticsSection/index.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';
import { useLogisticsCalculations } from './useLogisticsCalculations';
import TimeEstimates from './TimeEstimates';
import LaborDetails from './LaborDetails';
import LogisticsNotes from './LogisticsNotes';

const LogisticsSection = ({ data, distanceToSite, onChange }) => {
  const {
    totalLaborHours,
    recommendedDays,
    travelTimeNeeded
  } = useLogisticsCalculations(data, distanceToSite);

  const updateField = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Logistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeEstimates
          data={data}
          recommendedDays={recommendedDays}
          travelTimeNeeded={travelTimeNeeded}
          onChange={updateField}
        />

        <LaborDetails
          data={data}
          totalLaborHours={totalLaborHours}
          onChange={updateField}
        />
      </div>

      <LogisticsNotes
        notes={data.logisticalNotes}
        onChange={(value) => updateField('logisticalNotes', value)}
      />
    </div>
  );
};

export default LogisticsSection;

// TimeEstimates.jsx
const TimeEstimates = ({ data, recommendedDays, travelTimeNeeded, onChange }) => (
  <div className="space-y-4">
    <h4 className="font-medium">Time Estimates</h4>

    <NumberInput
      label="Work Days"
      value={data.estimatedDays}
      onChange={(value) => onChange('estimatedDays', value)}
      min={1}
      helperText="Base estimate before travel time"
    />

    <NumberInput
      label="Number of Trips"
      value={data.numberOfTrips}
      onChange={(value) => onChange('numberOfTrips', value)}
      min={1}
      helperText="Separate visits to site"
    />

    <NumberInput
      label="Hotel Rate"
      value={data.hotelRate}
      onChange={(value) => onChange('hotelRate', value)}
      min={0}
      prefix="$"
      helperText="Per night accommodation cost"
    />

    {travelTimeNeeded && (
      <div className="bg-blue-50 p-3 rounded">
        <p className="text-sm text-blue-800">
          Recommended Timeline: {recommendedDays} days
          <span className="block text-blue-600 text-xs mt-1">
            Includes travel time and work buffer
          </span>
        </p>
      </div>
    )}
  </div>
);

// LaborDetails.jsx
const LaborDetails = ({ data, totalLaborHours, onChange }) => (
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

// LogisticsNotes.jsx
const LogisticsNotes = ({ notes, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-2">
      Logistics Notes
    </label>
    <textarea
      value={notes}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded h-32"
      placeholder="Access restrictions, scheduling requirements, special considerations..."
    />
  </div>
);

// useLogisticsCalculations.js
export const useLogisticsCalculations = (data, distanceToSite) => {
  const totalLaborHours = (data.estimatedDays * 8) + (data.generalLaborHours || 0);
  const travelTimeNeeded = distanceToSite > 300;
  const travelDays = Math.ceil(distanceToSite / 300);
  const recommendedDays = Math.ceil((data.estimatedDays || 0) * 1.5) + travelDays;

  return {
    totalLaborHours,
    recommendedDays,
    travelTimeNeeded
  };
};
