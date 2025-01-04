// src/hooks/useLaborCosts.js
import { useMemo } from 'react';

export const useLaborCosts = (logistics, pricing) => {
  return useMemo(() => {
    if (!logistics || !pricing) return {};

    const standardDays = logistics.estimatedDays || 0;
    const additionalHours = logistics.generalLaborHours || 0;
    const hotelRate = logistics.hotelRate || 150;
    const numberOfTrips = logistics.numberOfTrips || 1;

    // Calculate travel costs
    const travel = {
      cost: ((logistics.distanceToSite || 0) * 2 * numberOfTrips * 0.63)
    };

    // Calculate hotel costs
    const hotel = {
      nights: Math.max(0, standardDays - 1) * numberOfTrips,
      cost: Math.max(0, standardDays - 1) * numberOfTrips * hotelRate
    };

    // Calculate per diem
    const perDiem = {
      days: standardDays * numberOfTrips,
      cost: standardDays * numberOfTrips * 50 * 2 // $50 per person per day, 2-person crew
    };

    // Calculate labor costs
    const labor = {
      standard: standardDays * 8 * (pricing.services?.generalLabor || 0),
      additional: additionalHours * (pricing.services?.generalLabor || 0),
      total: (standardDays * 8 + additionalHours) * (pricing.services?.generalLabor || 0)
    };

    return {
      travel,
      hotel,
      perDiem,
      labor,
      total: travel.cost + hotel.cost + perDiem.cost + labor.total
    };
  }, [logistics, pricing]);
};
