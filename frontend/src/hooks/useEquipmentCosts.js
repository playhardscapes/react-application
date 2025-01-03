 
// src/hooks/useEquipmentCosts.js
import { useMemo } from 'react';
import { EquipmentCalculator } from '../utils/equipmentCalculator';

export const useEquipmentCosts = (equipmentData) => {
  const costs = useMemo(() => {
    const calculator = new EquipmentCalculator(equipmentData);
    return calculator.calculateTotalCosts();
  }, [equipmentData]);

  return {
    ...costs,
    // Helper getters for common calculations
    get totalHoles() {
      return costs.details.totalHoles;
    },
    get totalInstallationHours() {
      return costs.details.totalInstallationHours;
    },
    get totalCost() {
      return costs.totals.grandTotal;
    }
  };
};
