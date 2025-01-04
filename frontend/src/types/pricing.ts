 
// src/types/pricing.ts

export interface MaterialPricing {
  // Patch Materials
  courtPatchBinder: number;  // Price per 5-gallon bucket
  sand: number;             // Price per 50lb bag
  cement: number;           // Price per 48qt set

  // Crack Repair
  minorCracks: number;      // Price per gallon
  majorCracks: number;      // Price per gallon

  // Coatings
  acrylicResurfacer: number;  // Price per gallon
  colorCoating: number;       // Price per gallon

  // Fiberglass System
  fiberglassMesh: number;     // Price per roll (320 sq ft)
  fiberglassPrimer: number;   // Price per gallon

  // Cushion System
  cushionBaseCoat: number;    // Price per gallon
  cushionFinishCoat: number;  // Price per gallon
}

export interface ServicePricing {
  // Surface Preparation
  pressureWashing: number;    // Price per sq ft

  // Line Painting
  linePaintingTennis: number;        // Price per court
  linePaintingPickleball: number;    // Price per court
  linePaintingFullBasketball: number;// Price per court
  linePaintingHalfBasketball: number;// Price per court

  // Installation
  holeCutting: number;              // Price per hole
  windscreenInstallation: number;   // Price per linear foot
  generalLabor: number;             // Price per hour
}

export interface EquipmentPricing {
  permanentTennisPoles: number;     // Price per set
  permanentPickleballPoles: number; // Price per set
  mobilePickleballNets: number;     // Price per unit
  lowGradeWindscreen: number;       // Price per linear foot
  highGradeWindscreen: number;      // Price per linear foot
}

export interface PricingConfiguration {
  materials: MaterialPricing;
  services: ServicePricing;
  equipment: EquipmentPricing;
}

// Default pricing configuration
export const defaultPricing: PricingConfiguration = {
  materials: {
    courtPatchBinder: 125,
    sand: 15,
    cement: 20,
    minorCracks: 100,
    majorCracks: 115,
    acrylicResurfacer: 10.25,
    colorCoating: 15.25,
    fiberglassMesh: 95,
    fiberglassPrimer: 14,
    cushionBaseCoat: 45,
    cushionFinishCoat: 45
  },
  services: {
    pressureWashing: 0.1,
    linePaintingTennis: 725,
    linePaintingPickleball: 600,
    linePaintingFullBasketball: 1000,
    linePaintingHalfBasketball: 750,
    holeCutting: 500,
    windscreenInstallation: 1,
    generalLabor: 50
  },
  equipment: {
    permanentTennisPoles: 500,
    permanentPickleballPoles: 405,
    mobilePickleballNets: 400,
    lowGradeWindscreen: 3.45,
    highGradeWindscreen: 5.19
  }
};
