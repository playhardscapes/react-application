 
// src/hooks/useMaterialsCosts.js
import { useMemo } from 'react';
import { MaterialsCalculator } from '../utils/materialsCalculator';

export const useMaterialsCosts = (surfaceData, dimensions, pricing) => {
  return useMemo(() => {
    const calculator = new MaterialsCalculator(surfaceData, dimensions, pricing);
    return calculator.calculateTotalCosts();
  }, [surfaceData, dimensions, pricing]);
};
