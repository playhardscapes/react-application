// src/components/estimator/sections/LogisticsSection/TimeEstimates.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const TimeEstimates = ({ data, onChange }) => (
  <div className="space-y-4">
    <h4 className="font-medium">Time Estimates</h4>

    <NumberInput
      label="Work Days"
      value={data.estimatedDays || 0}
      onChange={(value) => onChange('estimatedDays', value)}
      min={1}
      helperText="Base estimate before travel time"
    />

    <NumberInput
      label="Number of Trips"
      value={data.numberOfTrips || 1}
      onChange={(value) => onChange('numberOfTrips', value)}
      min={1}
      helperText="Separate visits to site"
    />

    <NumberInput
      label="Hotel Rate"
      value={data.hotelRate || 150}
      onChange={(value) => onChange('hotelRate', value)}
      min={0}
      prefix="$"
      helperText="Per night accommodation cost"
    />
  </div>
);

