 
// src/components/pricing/LaborPricingDisplay.jsx
import React from 'react';
import { useLaborCosts } from '../../hooks/useLaborCosts';
import { formatCurrency } from '../../utils/formatting';

const CostSection = ({ title, children }) => (
  <div className="border-t border-gray-200 py-3">
    <h4 className="font-medium mb-2">{title}</h4>
    {children}
  </div>
);

const CostRow = ({ label, value, cost, unit = '', info }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">
        {label} {value && `(${value} ${unit})`}
      </span>
      <span>{formatCurrency(cost)}</span>
    </div>
    {info && <div className="text-xs text-gray-500">{info}</div>}
  </div>
);

const LaborPricingDisplay = ({ logisticsData, installationHours, pricing }) => {
  const costs = useLaborCosts(logisticsData, installationHours, pricing);
  const { labor, travel, hotel, perDiem, hours, details } = costs;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Labor & Travel Costs</h3>

      {/* Project Timeline Summary */}
      <div className="bg-blue-50 p-3 rounded mb-4">
        <h4 className="font-medium text-blue-800 mb-2">Project Timeline</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-blue-900">
          <div>
            <span className="text-blue-700">Total Days:</span>
            <span className="ml-2">{details.totalDays}</span>
          </div>
          <div>
            <span className="text-blue-700">Total Hours:</span>
            <span className="ml-2">{details.totalHours}</span>
          </div>
          <div>
            <span className="text-blue-700">Number of Trips:</span>
            <span className="ml-2">{details.numberOfTrips}</span>
          </div>
        </div>
      </div>

      {/* Labor Costs */}
      <CostSection title="Labor">
        <div className="space-y-2">
          <CostRow
            label="Standard Labor"
            value={hours.standard}
            unit="hours"
            cost={labor.standard}
            info={`${hours.standard / 8} days at 8 hours per day`}
          />
          {hours.additional > 0 && (
            <CostRow
              label="Additional Labor"
              value={hours.additional}
              unit="hours"
              cost={labor.additional}
            />
          )}
          {hours.installation > 0 && (
            <CostRow
              label="Installation Labor"
              value={hours.installation}
              unit="hours"
              cost={labor.installation}
            />
          )}
        </div>
      </CostSection>

      {/* Travel Costs */}
      <CostSection title="Travel Expenses">
        <div className="space-y-2">
          <CostRow
            label="Mileage"
            value={travel.totalMiles}
            unit="miles"
            cost={travel.cost}
            info="Round trip for each visit at IRS rate"
          />
          {hotel.nights > 0 && (
            <CostRow
              label="Hotel"
              value={hotel.nights}
              unit="nights"
              cost={hotel.cost}
              info={`at ${formatCurrency(logisticsData.hotelRate)} per night`}
            />
          )}
          <CostRow
            label="Per Diem"
            value={perDiem.days * perDiem.crew}
            unit="person-days"
            cost={perDiem.cost}
            info={`${perDiem.crew} person crew for ${perDiem.days} days`}
          />
        </div>
      </CostSection>

      {/* Total */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="text-sm">
            <span className="text-gray-600">Labor Subtotal:</span>
            <span className="ml-2">{formatCurrency(labor.total)}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Travel Subtotal:</span>
            <span className="ml-2">{formatCurrency(travel.cost + hotel.cost + perDiem.cost)}</span>
          </div>
        </div>
        <div className="text-lg font-semibold flex justify-between mt-2">
          <span>Total Labor & Travel:</span>
          <span>{formatCurrency(costs.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default LaborPricingDisplay;
