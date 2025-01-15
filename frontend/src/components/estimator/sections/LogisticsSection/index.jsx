// src/components/estimator/sections/LogisticsSection/index.jsx
import React from 'react';
import { TimeEstimates } from './TimeEstimates';
import { LaborDetails } from './LaborDetails';
import { LogisticsNotes } from './LogisticsNotes';

const DEFAULT_LOGISTICS = {
  travelDays: 2,
  numberOfTrips: 1,
  generalLaborHours: 0,
  hotelRate: 150,
  logisticalNotes: '',
  distanceToSite: 0
};

const LogisticsSection = ({ data = {}, onChange, errors = {} }) => {
  // Parse JSONB field if it's a string
  const logisticsData = typeof data.logistics === 'string' ? 
    JSON.parse(data.logistics) : 
    (data.logistics || DEFAULT_LOGISTICS);

  const updateField = (field, value) => {
    const updatedLogistics = {
      ...logisticsData,
      [field]: value
    };

    // Update the JSONB field
    onChange({
      ...data,
      logistics: updatedLogistics
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Project Logistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeEstimates
          data={logisticsData}
          onChange={updateField}
          errors={errors}
        />

        <LaborDetails
          data={logisticsData}
          onChange={updateField}
          errors={errors}
        />
      </div>

      <LogisticsNotes
        notes={logisticsData.logisticalNotes || ''}
        onChange={(value) => updateField('logisticalNotes', value)}
        error={errors.logisticalNotes}
      />
    </div>
  );
};

export default LogisticsSection;