// src/hooks/useLogisticsCosts.js
import { usePricing } from './usePricing';

const DEFAULT_LOGISTICS = {
  travelDays: 2,
  numberOfTrips: 1,
  generalLaborHours: 0,
  hotelRate: 150,
  logisticalNotes: '',
  distanceToSite: 0
};

export const useLogisticsCosts = (data) => {
  const { getPriceByName } = usePricing();
  
  // Safely handle logistics data with defaults
  const logisticsData = (() => {
    if (!data.logistics) return DEFAULT_LOGISTICS;
    if (typeof data.logistics === 'string') {
      try {
        return { ...DEFAULT_LOGISTICS, ...JSON.parse(data.logistics) };
      } catch {
        return DEFAULT_LOGISTICS;
      }
    }
    return { ...DEFAULT_LOGISTICS, ...data.logistics };
  })();

  const calculateLodging = () => {
    const nights = (logisticsData.travelDays || 0) + 1;
    const totalNights = nights * (logisticsData.numberOfTrips || 1);
    const cost = totalNights * (logisticsData.hotelRate || 150);
    
    return {
      nightsPerTrip: nights,
      totalNights,
      ratePerNight: logisticsData.hotelRate || 150,
      total: cost
    };
  };

  const calculateMileage = () => {
    const milesPerTrip = (logisticsData.distanceToSite || 0) * 2; // Round trip
    const totalMiles = milesPerTrip * (logisticsData.numberOfTrips || 1);
    const ratePerMile = 0.67; // Current IRS rate - could be made configurable
    
    return {
      milesPerTrip,
      totalMiles,
      ratePerMile,
      total: totalMiles * ratePerMile
    };
  };

  const calculateLabor = () => {
    const laborRate = getPriceByName('General Labor Rate') || 0;
    const additionalLaborCost = (logisticsData.generalLaborHours || 0) * laborRate;
    
    return {
      hours: logisticsData.generalLaborHours || 0,
      ratePerHour: laborRate,
      total: additionalLaborCost
    };
  };

  const lodging = calculateLodging();
  const mileage = calculateMileage();
  const labor = calculateLabor();

  return {
    lodging,
    mileage,
    labor,
    total: lodging.total + mileage.total + labor.total,
    details: {
      numberOfTrips: logisticsData.numberOfTrips || 1,
      travelDays: logisticsData.travelDays || 0,
      notes: logisticsData.logisticalNotes || ''
    }
  };
};