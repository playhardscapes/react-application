// src/components/estimator/sections/EquipmentSection/TennisEquipment.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const TennisEquipment = ({ data, onChange, error }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Tennis Equipment</h4>
    <NumberInput
      label="Permanent Tennis Net Posts (sets)"
      value={data.permanentTennisPoles}
      onChange={(value) => onChange(Number(value))}  // Convert to number
      min={0}
      error={error}
      helperText="One set includes two posts"
    />
  </div>
);
