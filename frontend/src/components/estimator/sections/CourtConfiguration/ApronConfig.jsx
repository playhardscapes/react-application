 
// src/components/estimator/sections/CourtConfiguration/ApronConfig.jsx
import React from 'react';
import { ColorSelect } from './ColorSelect';

export const ApronConfig = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <h4 className="font-medium mb-3">Apron/Boundary Configuration</h4>
    <ColorSelect
      label="Apron Color"
      value={data.color}
      onChange={(color) => onChange({ ...data, color })}
    />
  </div>
);
