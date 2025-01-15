// src/components/estimator/sections/EquipmentSection/WindscreenEquipment.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';

export const Windscreen = ({ data, onChange, errors = {} }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Windscreen</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NumberInput
        label="Low-Grade Windscreen (linear feet)"
        value={data.lowGradeWindscreen}
        onChange={(value) => onChange('lowGradeWindscreen', value)}
        min={0}
        error={errors.lowGrade}
      />
      <NumberInput
        label="High-Grade Windscreen (linear feet)"
        value={data.highGradeWindscreen}
        onChange={(value) => onChange('highGradeWindscreen', value)}
        min={0}
        error={errors.highGrade}
      />
    </div>
  </div>
);