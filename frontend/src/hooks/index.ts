 
// src/hooks/index.ts
export * from './useColorCoating';
export * from './useEquipmentCosts';
export * from './useLinePainting';
export * from './useMaterials';
export * from './useTravelCosts';

// Add utility function for consistent pricing calculations
export const calculateGallonsNeeded = (squareFeet: number, coverage: number = 125, coats: number = 2): number => {
  return Math.ceil((squareFeet / coverage) * 1.5 * coats);
};

export const calculateDrumsRequired = (gallons: number, gallonsPerDrum: number = 30): number => {
  return Math.ceil(gallons / gallonsPerDrum);
};
