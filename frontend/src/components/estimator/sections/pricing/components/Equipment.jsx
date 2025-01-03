 
// pricing/components/Equipment.jsx
import React from 'react';
import { formatCurrency } from '../utils';

export const Equipment = ({ data }) => {
  const { tennis, pickleball, windscreen } = data;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Equipment</h3>
      <div className="space-y-2">
        {tennis.quantity > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tennis Posts ({tennis.quantity} sets):</span>
            <span>{formatCurrency(tennis.cost)}</span>
          </div>
        )}

        {pickleball.posts.quantity > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pickleball Posts ({pickleball.posts.quantity} sets):</span>
            <span>{formatCurrency(pickleball.posts.cost)}</span>
          </div>
        )}

        {pickleball.mobileNets.quantity > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Mobile Pickleball Nets ({pickleball.mobileNets.quantity} units):</span>
            <span>{formatCurrency(pickleball.mobileNets.cost)}</span>
          </div>
        )}

        {windscreen.lowGrade.feet > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Low-Grade Windscreen ({windscreen.lowGrade.feet} ft):</span>
            <span>{formatCurrency(windscreen.lowGrade.cost)}</span>
          </div>
        )}

        {windscreen.highGrade.feet > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">High-Grade Windscreen ({windscreen.highGrade.feet} ft):</span>
            <span>{formatCurrency(windscreen.highGrade.cost)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total Equipment:</span>
            <span>{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
