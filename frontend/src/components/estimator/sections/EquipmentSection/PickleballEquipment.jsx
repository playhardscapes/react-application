// src/components/estimator/sections/EquipmentSection/PickleballEquipment.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const PickleballEquipment = ({ data, onChange, errors = {} }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Pickleball Equipment</h4>
    <NumberInput
      label="Permanent Pickleball Posts (sets)"
      value={data.permanentPickleballPoles}
      onChange={(value) => onChange('permanentPickleballPoles', value)}
      min={0}
      error={errors.permanentPoles}
      helperText="One set includes two posts"
    />
    <NumberInput
      label="Mobile Pickleball Nets"
      value={data.mobilePickleballNets}
      onChange={(value) => onChange('mobilePickleballNets', value)}
      min={0}
      error={errors.mobileNets}
    />
  </div>
);