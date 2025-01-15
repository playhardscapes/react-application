// src/utils/costCalculations.js
const { 
    useMaterialsCosts, 
    useEquipmentCosts, 
    useLaborCosts 
  } = require('../hooks/costHooks');
  
  function calculateTotalProjectCost(projectData, pricing) {
    // Use existing hooks logic to calculate costs
    const materialsCosts = useMaterialsCosts(
      projectData.surfaceSystem, 
      projectData.dimensions, 
      pricing
    );
    
    const equipmentCosts = useEquipmentCosts(
      projectData.equipment, 
      pricing
    );
    
    const laborCosts = useLaborCosts(
      projectData.logistics, 
      pricing
    );
  
    // Base total before margin
    const baseTotal = materialsCosts.total + 
                     laborCosts.total + 
                     equipmentCosts.total;
  
    // Apply margin (default 30%)
    const marginRate = 0.3;
    const margin = baseTotal * marginRate;
    const projectTotal = baseTotal + margin;
  
    // Per square foot cost
    const perSquareFootCost = projectTotal / (projectData.dimensions?.squareFootage || 1);
  
    return {
      materialsCosts,
      equipmentCosts,
      laborCosts,
      baseTotal,
      marginRate,
      margin,
      projectTotal,
      perSquareFootCost
    };
  }
  
  module.exports = {
    calculateTotalProjectCost
  };