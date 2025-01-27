// src/components/estimator/EstimationForm/tabs/Logistics/index.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { TimeEstimates } from './components/TimeEstimates';
import { LaborDetails } from './components/LaborDetails';
import { LogisticsNotes } from './components/LogisticsNotes';

const DEFAULT_LOGISTICS = {
  travelDays: 2,
  numberOfTrips: 1,
  generalLaborHours: 0,
  hotelRate: 150,
  logisticalNotes: '',
  distanceToSite: 0
};

const Logistics = ({ data = {}, onChange }) => {
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
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Project Logistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TimeEstimates
            data={logisticsData}
            onChange={updateField}
          />

          <LaborDetails
            data={logisticsData}
            onChange={updateField}
          />
        </div>

        <LogisticsNotes
          notes={logisticsData.logisticalNotes || ''}
          onChange={(value) => updateField('logisticalNotes', value)}
        />
      </div>
    </Card>
  );
};

export default Logistics;