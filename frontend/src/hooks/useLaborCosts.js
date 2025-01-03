 
// src/hooks/useLaborCosts.js
import { useMemo } from 'react';
import { LaborCalculator } from '../utils/laborCalculator';

export const useLaborCosts = (logisticsData, installationHours, pricing) => {
  return useMemo(() => {
    const calculator = new LaborCalculator(logisticsData, installationHours, pricing);
    return calculator.calculateTotalCosts();
  }, [logisticsData, installationHours, pricing]);
};
