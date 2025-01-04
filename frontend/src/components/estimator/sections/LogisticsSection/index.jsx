 
// src/components/estimator/sections/LogisticsSection/index.jsx
import React from 'react';
import { TimeEstimates } from './TimeEstimates';
import { LaborDetails } from './LaborDetails';
import { LogisticsNotes } from './LogisticsNotes';

const LogisticsSection = ({ data, onChange }) => {
  const updateField = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Calculate total labor hours
  const totalLaborHours = (data.estimatedDays || 0) * 8 + (data.generalLaborHours || 0);

  // Calculate if travel time is needed based on distance
  const travelTimeNeeded = (data.distanceToSite || 0) > 300;
  const travelDays = Math.ceil((data.distanceToSite || 0) / 300);
  const recommendedDays = Math.ceil((data.estimatedDays || 0) * 1.5) + travelDays;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Logistics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeEstimates
          data={data}
          recommendedDays={recommendedDays}
          travelTimeNeeded={travelTimeNeeded}
          onChange={updateField}
        />

        <LaborDetails
          data={data}
          totalLaborHours={totalLaborHours}
          onChange={updateField}
        />
      </div>

      <LogisticsNotes
        notes={data.logisticalNotes}
        onChange={(value) => updateField('logisticalNotes', value)}
      />
    </div>
  );
};

export default LogisticsSection;
