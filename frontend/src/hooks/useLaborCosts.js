// src/hooks/useLaborCosts.js
import { useMemo } from 'react';

export const useLaborCosts = (logistics, pricing) => {
  return useMemo(() => {
    if (!logistics || !pricing) return {};

    console.log('Labor costs calculation input:', { logistics, pricing }); // Debug log

    const standardDays = logistics.estimatedDays || 0;
    const additionalHours = logistics.generalLaborHours || 0;
    const hotelRate = logistics.hotelRate || 150;
    const numberOfTrips = logistics.numberOfTrips || 1;
    const distanceToSite = logistics.distanceToSite || 0;
    const mileageRate = 0.63; // IRS standard rate

    console.log('Using distance:', distanceToSite); // Debug log

    // Calculate travel costs
    const travel = {
      totalMiles: distanceToSite * 2 * numberOfTrips,
      cost: (distanceToSite * 2 * numberOfTrips * mileageRate)
    };

    // Calculate hotel costs
    const hotel = {
      nights: Math.max(0, standardDays - 1) * numberOfTrips,
      cost: Math.max(0, standardDays - 1) * numberOfTrips * hotelRate
    };

    // Calculate per diem
    const perDiem = {
      days: standardDays * numberOfTrips,
      crew: 2,
      cost: standardDays * numberOfTrips * 50 * 2
    };

    // Calculate labor costs
    const laborRate = pricing.services?.generalLabor || 0;
    const labor = {
      standard: standardDays * 8 * laborRate,
      additional: additionalHours * laborRate,
      total: (standardDays * 8 + additionalHours) * laborRate
    };

    const result = {
      travel,
      hotel,
      perDiem,
      labor,
      details: {
        totalDays: standardDays * numberOfTrips,
        numberOfTrips,
        totalHours: standardDays * 8 + additionalHours,
        mileageRate,
        laborRate
      },
      total: travel.cost + hotel.cost + perDiem.cost + labor.total
    };

    console.log('Labor costs calculation result:', result); // Debug log

    return result;
  }, [logistics, pricing]);
};