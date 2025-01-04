 
// src/utils/calculations.js

export const calculateCoatingGallons = (squareFeet, coatings = 2) => {
  const coverage = 125; // sq ft per gallon
  const wasteFactor = 1.5;
  return Math.ceil((squareFeet / coverage) * wasteFactor * coatings);
};

export const calculateDrums = (gallons, gallonsPerDrum = 30) => {
  return Math.ceil(gallons / gallonsPerDrum);
};

export const calculatePatchWork = (gallons) => ({
  binder: {
    gallons,
    buckets: Math.ceil(gallons / 5) // 5 gallons per bucket
  },
  sand: {
    bags: Math.ceil(gallons / 3 * 2) // 2 bags per 3 gallons
  },
  cement: {
    quarts: Math.ceil(gallons) // 1 quart per gallon
  }
});

export const calculateFiberglassMaterials = (area) => ({
  rolls: Math.ceil(area / 320), // 320 sq ft per roll
  primer: Math.ceil(area / 75) // 75 sq ft per gallon coverage
});

export const calculateTravelCosts = (distance, trips, mileageRate = 0.63) => {
  const roundTripMiles = distance * 2;
  const totalMiles = roundTripMiles * trips;
  return {
    miles: totalMiles,
    cost: totalMiles * mileageRate
  };
};

export const calculateLaborHours = ({
  squareFeet,
  patchWork,
  fiberglassMesh,
  cushionSystem,
  numberOfCourts
}) => {
  let hours = 0;

  // Base surface prep
  hours += squareFeet / 1000 * 2; // 2 hours per 1000 sq ft

  // Patch work
  if (patchWork?.needed) {
    hours += patchWork.estimatedGallons * 0.5; // 30 min per gallon
  }

  // Fiberglass
  if (fiberglassMesh?.needed) {
    hours += fiberglassMesh.area / 200; // 1 hour per 200 sq ft
  }

  // Cushion system
  if (cushionSystem?.needed) {
    hours += cushionSystem.area / 150; // 1 hour per 150 sq ft
  }

  // Line painting
  hours += numberOfCourts * 4; // 4 hours per court

  return Math.ceil(hours);
};

export const calculateInstallationHoles = (equipment) => {
  const tennisHoles = (equipment.permanentTennisPoles || 0) * 2;
  const pickleballHoles = (equipment.permanentPickleballPoles || 0) * 2;
  const basketballHoles = (equipment.basketballSystems || [])
    .filter(system => system.mounted === 'ground')
    .length;

  return tennisHoles + pickleballHoles + basketballHoles;
};

export const calculateTotalCost = ({
  materials,
  labor,
  equipment = 0,
  taxRate = 0.06,
  marginRate = 0.3
}) => {
  const subtotal = materials + labor + equipment;
  const tax = subtotal * taxRate;
  const margin = subtotal * marginRate;

  return {
    subtotal,
    tax,
    margin,
    total: subtotal + tax + margin
  };
};
