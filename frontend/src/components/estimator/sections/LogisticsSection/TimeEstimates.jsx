// src/components/estimator/sections/LogisticsSection/TimeEstimates.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const TimeEstimates = ({ data, onChange, errors = {} }) => (
  <div className="space-y-4">
    <h4 className="font-medium">Time Estimates</h4>

    <NumberInput
      label="Work Days"
      value={data.travelDays || 0}
      onChange={(value) => onChange('travelDays', value)}
      min={1}
      error={errors.travelDays}
      helperText="Base estimate before travel time"
    />

    <NumberInput
      label="Number of Trips"
      value={data.numberOfTrips || 1}
      onChange={(value) => onChange('numberOfTrips', value)}
      min={1}
      error={errors.numberOfTrips}
      helperText="Separate visits to site"
    />

    <NumberInput
      label="Hotel Rate"
      value={data.hotelRate || 150}
      onChange={(value) => onChange('hotelRate', value)}
      min={0}
      prefix="$"
      error={errors.hotelRate}
      helperText="Per night accommodation cost"
    />
  </div>
);