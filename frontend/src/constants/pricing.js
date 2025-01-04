// src/constants/pricing.js

/**
 * @typedef {Object} MaterialPricing
 * @property {number} cpb - Court Patch Binder (5 gallons)
 * @property {number} sand - Sand (50 lb bag)
 * @property {number} cement - Cement (48 quarts)
 * @property {number} minorCracks - Joint Filler Minor Cracks (per gallon)
 * @property {number} majorCracks - Joint Filler Major Cracks (per gallon)
 * @property {number} acrylicResurfacer - Acrylic Resurfacer (per gallon)
 * @property {number} colorCoating - Color Coating (per gallon)
 * @property {number} fiberglassMesh - Fiberglass Mesh (per roll)
 * @property {number} fiberglassPrimer - Fiberglass Primer (per gallon)
 * @property {number} cushionBaseCoat - Cushion System Base Coat (per gallon)
 * @property {number} cushionFinishCoat - Cushion System Finish Coat (per gallon)
 */

/**
 * @typedef {Object} ServicePricing
 * @property {number} courtPatchBinder - Court Patch Binder (per gallon)
 * @property {number} fiberglassMesh - Fiberglass Mesh (per square foot)
 * @property {number} fiberglassPrimer - Fiberglass Primer (per square foot)
 * @property {number} acrylicResurfacer - Acrylic Resurfacer (per gallon)
 * @property {number} colorCoat - Color Coat (per gallon)
 * @property {number} cushionSystem - Cushion System (per square foot)
 * @property {number} pressureWashing - Pressure Washing (per square foot)
 * @property {number} linePaintingTennis - Tennis Court Lines (per court)
 * @property {number} linePaintingPickleball - Pickleball Court Lines (per court)
 * @property {number} linePaintingFullBasketball - Full Basketball Court Lines
 * @property {number} linePaintingHalfBasketball - Half Basketball Court Lines
 * @property {number} holeCutting - Hole Cutting (per hole)
 * @property {number} windscreenInstallation - Windscreen Installation (per linear foot)
 * @property {number} generalLabor - General Labor (hourly rate)
 */

/**
 * @typedef {Object} EquipmentPricing
 * @property {number} permanentTennisPoles - Permanent Tennis Poles (per set)
 * @property {number} permanentPickleballPoles - Permanent Pickleball Poles (per set)
 * @property {number} mobilePickleballNets - Mobile Pickleball Nets (per unit)
 * @property {number} lowGradeWindscreen - Low-Grade Windscreen (per linear foot)
 * @property {number} highGradeWindscreen - High-Grade Windscreen (per linear foot)
 */

/**
 * @typedef {Object} PricingConfiguration
 * @property {MaterialPricing} materials
 * @property {ServicePricing} services
 * @property {EquipmentPricing} equipment
 */

// Initial default values matching your UI structure
export const defaultPricingConfig = {
  materials: {
    cpb: 125,
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
    courtPatchBinder: 125,
    fiberglassMesh: 0.1,
    fiberglassPrimer: 0.1,
    acrylicResurfacer: 0.18,
    colorCoat: 0.18,
    cushionSystem: 0.25,
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

// Utility functions for calculations
export const calculateGallonsNeeded = (squareFeet, coverage = 125, coats = 2) => {
  return Math.ceil((squareFeet / coverage) * 1.5 * coats);
};

export const calculateDrumsRequired = (gallons, gallonsPerDrum = 30) => {
  return Math.ceil(gallons / gallonsPerDrum);
};
