// src/components/estimator/sections/LogisticsSection/LogisticsNotes.jsx
import React from 'react';

export const LogisticsNotes = ({ notes = '', onChange }) => (
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