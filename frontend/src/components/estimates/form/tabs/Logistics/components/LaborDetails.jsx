// src/components/estimator/sections/LogisticsSection/LaborDetails.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';
import { formatCurrency } from '@/utils/formatting';

export const LaborDetails = ({ data, onChange, errors = {} }) => {
  const totalLaborHours = ((data.travelDays || 0) * 8) + (data.generalLaborHours || 0);
  const totalTravelMiles = (data.distanceToSite || 0) * 2 * (data.numberOfTrips || 1);
  const totalHotelNights = Math.max(0, (data.travelDays || 0) - 1) * (data.numberOfTrips || 1);
  const hotelCosts = totalHotelNights * (data.hotelRate || 150);

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Labor Details</h4>

      <NumberInput
        label="Additional Labor Hours"
        value={data.generalLaborHours || 0}
        onChange={(value) => onChange('generalLaborHours', value)}
        min={0}
        error={errors.generalLaborHours}
        helperText="Beyond standard work days"
      />

      <div className="bg-gray-50 p-3 rounded space-y-2">
        <p className="text-sm font-medium">Total Labor: {totalLaborHours} hours</p>
        <p className="text-sm text-gray-600">
          {data.travelDays} days × 8 hours + {data.generalLaborHours || 0} additional hours
        </p>
      </div>

      {data.distanceToSite > 0 && (
        <div className="bg-blue-50 p-3 rounded space-y-2">
          <p className="text-sm text-blue-800">
            Travel Distance: {Math.round(data.distanceToSite)} miles per trip
          </p>
          <p className="text-sm text-blue-600">
            Total Travel: {Math.round(totalTravelMiles)} miles
          </p>
        </div>
      )}

      {totalHotelNights > 0 && (
        <div className="bg-blue-50 p-3 rounded space-y-2">
          <p className="text-sm text-blue-800">
            Hotel Stays: {totalHotelNights} nights
          </p>
          <p className="text-sm text-blue-600">
            Total Hotel Cost: {formatCurrency(hotelCosts)}
          </p>
        </div>
      )}
    </div>
  );
};