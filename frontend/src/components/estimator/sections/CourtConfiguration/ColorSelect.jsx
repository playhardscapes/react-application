 
// src/components/estimator/sections/CourtConfiguration/ColorSelect.jsx
import React from 'react';
import { COLORS } from './constants';

export const ColorSelect = ({ label, value, onChange, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">Select color...</option>
      {COLORS.map(color => (
        <option key={color.value} value={color.value}>
          {color.label}
        </option>
      ))}
    </select>
  </div>
);
