 
// src/components/estimator/sections/CourtConfiguration/BasketballCourt.jsx
import React from 'react';
import { ColorSelect } from './ColorSelect';

export const BasketballCourt = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <label className="flex items-center space-x-2 mb-3">
      <input
        type="checkbox"
        checked={data.selected || false}
        onChange={(e) => onChange({ ...data, selected: e.target.checked })}
        className="h-4 w-4"
      />
      <span className="font-medium">Basketball</span>
    </label>

    {data.selected && (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Court Type</label>
          <select
            value={data.courtType || ''}
            onChange={(e) => onChange({ ...data, courtType: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select type...</option>
            <option value="half">Half Court</option>
            <option value="full">Full Court</option>
          </select>
        </div>

        <ColorSelect
          label="Court Color"
          value={data?.colors?.court}
          onChange={(color) => onChange({
            ...data,
            colors: { ...data.colors, court: color }
          })}
        />
      </div>
    )}
  </div>
);
