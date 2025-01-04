 
// src/components/estimator/sections/LogisticsSection/TimeEstimates.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const TimeEstimates = ({ data, recommendedDays, travelTimeNeeded, onChange }) => (
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
