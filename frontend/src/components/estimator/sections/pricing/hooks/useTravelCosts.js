// hooks/useTravelCosts.js
import { useMemo } from 'react';

export const useTravelCosts = (projectData, globalPricing) => {
  return useMemo(() => {
    const logistics = projectData?.logistics || {};
    const prices = globalPricing?.services || {};
    const distanceToSite = projectData?.clientInfo?.distanceToSite || 0;

    // Hotel costs calculation
    const hotelRate = logistics.hotelRate || 150;
    const estimatedDays = logistics.estimatedDays || 0;
    const hotelCosts = {
      days: estimatedDays,
      cost: estimatedDays * hotelRate
    };

    // Mileage costs calculation
    const numberOfTrips = logistics.numberOfTrips || 1;
    const mileageCosts = {
      miles: distanceToSite * 2 * numberOfTrips, // Round trip
      cost: (distanceToSite * 2 * numberOfTrips) * 0.63 // IRS rate
    };

    // Labor costs calculation
    const generalLaborHours = logistics.generalLaborHours || 0;
    const generalLaborRate = prices.generalLabor || 50;
    const laborCosts = {
      hours: generalLaborHours,
      cost: generalLaborHours * generalLaborRate
    };

    // Calculate total
    const total = hotelCosts.cost + mileageCosts.cost + laborCosts.cost;

    console.log({
      hotelCosts,
      mileageCosts,
      laborCosts,
      total
    });

    return {
      hotel: hotelCosts,
      mileage: mileageCosts,
      labor: laborCosts,
      total: total
    };
  }, [projectData, globalPricing]);
};
