// src/components/estimator/sections/LogisticsSection/index.jsx
import React from 'react';
import { TimeEstimates } from './TimeEstimates';
import { LaborDetails } from './LaborDetails';
import { LogisticsNotes } from './LogisticsNotes';

const LogisticsSection = ({ data, onChange }) => {
  console.log('LogisticsSection received data:', data);

  const updateField = (field, value) => {
    console.log('Updating logistics field:', field, value);
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Logistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeEstimates
          data={data}
          onChange={updateField}
        />

        <LaborDetails
          data={data}
          onChange={updateField}
        />
      </div>

      <LogisticsNotes
        notes={data.logisticalNotes || ''}
        onChange={(value) => updateField('logisticalNotes', value)}
      />
    </div>
  );
};

export default LogisticsSection;