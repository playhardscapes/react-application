// src/hooks/useLaborCosts.js
import { useMemo } from 'react';

export const useLaborCosts = (estimateData, pricing) => {
  return useMemo(() => {
    if (!estimateData || !pricing) return { total: 0 };

    // Ensure we have the required pricing structures
    const services = pricing.services || {};
    
    // Add some debug logging
    console.log('Services pricing for labor:', services);

    const logistics = estimateData.logistics || {
      travelDays: 2,
      numberOfTrips: 1,
      generalLaborHours: 0,
      distanceToSite: 0,
      hotelRate: 150
    };

    const mileageRate = 0.63;
    const perDiemRate = 50;

    const travel = {
      totalMiles: (logistics.distanceToSite || 0) * 2 * (logistics.numberOfTrips || 1),
      cost: ((logistics.distanceToSite || 0) * 2 * (logistics.numberOfTrips || 1) * mileageRate)
    };

    const hotel = {
      nights: Math.max(0, (logistics.travelDays || 2) - 1) * (logistics.numberOfTrips || 1),
      cost: Math.max(0, (logistics.travelDays || 2) - 1) * (logistics.numberOfTrips || 1) * (logistics.hotelRate || 150)
    };

    const perDiem = {
      days: (logistics.travelDays || 2) * (logistics.numberOfTrips || 1),
      crew: 2,
      cost: (logistics.travelDays || 2) * (logistics.numberOfTrips || 1) * perDiemRate * 2
    };

    const labor = {
      standard: (logistics.travelDays || 2) * 8 * (services.generalLabor || 65),
      additional: (logistics.generalLaborHours || 0) * (services.generalLabor || 65),
      total: ((logistics.travelDays || 2) * 8 + (logistics.generalLaborHours || 0)) * (services.generalLabor || 65)
    };

    const total = travel.cost + hotel.cost + perDiem.cost + labor.total;

    return {
      travel,
      hotel,
      perDiem,
      labor,
      details: {
        totalDays: (logistics.travelDays || 2) * (logistics.numberOfTrips || 1),
        numberOfTrips: logistics.numberOfTrips || 1,
        totalHours: (logistics.travelDays || 2) * 8 + (logistics.generalLaborHours || 0),
        mileageRate,
        laborRate: services.generalLabor || 65
      },
      total
    };
  }, [estimateData, pricing]);
};