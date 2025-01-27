// src/hooks/useResurfacerCosts.js
import { usePricing } from './usePricing';

export const useResurfacerCosts = (squareFootage = 0) => {
  const { getPriceByName } = usePricing();

  const calculateResurfacer = () => {
    if (!squareFootage) return { drums: 0, gallons: 0, costs: { materials: 0, freight: 0, installation: 0, total: 0 }};

    // Constants
    const SQFT_PER_GALLON = 100;
    const WASTE_FACTOR = 1.25;
    const COATS = 2;
    const GALLONS_PER_DRUM = 30;
    const FREIGHT_PER_DRUM = 100;

    // Calculate total gallons needed
    const baseGallons = squareFootage / SQFT_PER_GALLON;
    const gallonsWithWaste = baseGallons * WASTE_FACTOR;
    const totalGallons = gallonsWithWaste * COATS;

    // Calculate number of drums (rounded up)
    const drumsNeeded = Math.ceil(totalGallons / GALLONS_PER_DRUM);

    // Get prices
    const materialPricePerDrum = getPriceByName('Acrylic Resurfacer - Material') || 0;
    const installationPricePerSqFt = getPriceByName('Acyrlic Refurfacer - (2) Coats') || 0;

    // Calculate costs
    const materialCost = drumsNeeded * materialPricePerDrum;
    const freightCost = drumsNeeded * FREIGHT_PER_DRUM;
    const installationCost = squareFootage * installationPricePerSqFt;

    return {
      drums: drumsNeeded,
      gallons: totalGallons,
      costs: {
        materials: materialCost,
        freight: freightCost,
        installation: installationCost,
        total: materialCost + freightCost + installationCost
      },
      details: {
        baseGallons,
        gallonsWithWaste,
        totalGallons,
        sqftPerGallon: SQFT_PER_GALLON,
        wasteFactor: WASTE_FACTOR,
        coats: COATS
      }
    };
  };

  return calculateResurfacer();
};