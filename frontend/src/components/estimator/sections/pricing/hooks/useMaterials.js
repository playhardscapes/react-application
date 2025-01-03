// pricing/hooks/useMaterials.js
import { useMemo } from 'react';

export const useMaterials = (projectData, globalPricing) => {
  return useMemo(() => {
    const surfaces = projectData.surfaceSystem || {};
    const dimensions = projectData.substrate?.dimensions || {};
    const prices = globalPricing?.materials || {};
    const squareFootage = dimensions.squareFootage || 0;

    const patchWorkGallons = surfaces.patchWork?.estimatedGallons || 0;

    const binderGallons = patchWorkGallons;
    const sandBags = Math.ceil(patchWorkGallons / 3 * 2); // 2 bags per 3 gallons of binder
    const cementQuarts = Math.ceil(patchWorkGallons); // 4 quarts (1 gallon) per 3 gallons of binder

    const binderCost = binderGallons * (prices.cpb / 5);
    const sandCost = sandBags * prices.sand;
    const cementCost = (cementQuarts / 4) * prices.cement; // 4 quarts per gallon

    const patchBinderTotal = binderCost + sandCost + cementCost;

return {
  patchBinder: {
    gallons: binderGallons,
    sandBags,
    cementQuarts,
    cost: patchBinderTotal
  },
        crackFiller: {
        minorGallons: surfaces.patchWork?.minorCrackGallons || 0,
        majorGallons: surfaces.patchWork?.majorCrackGallons || 0,
        minorCost: (surfaces.patchWork?.minorCrackGallons || 0) * (prices.minorCracks || 0),
        majorCost: (surfaces.patchWork?.majorCrackGallons || 0) * (prices.majorCracks || 0)
      },
      resurfacer: {
        actualGallons: Math.ceil((squareFootage / 125) * 1.5 * 2),
        drumsRequired: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30),
        cost: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30) * ((prices.acrylicResurfacer || 0) * 30)
      },
      colorCoating: {
        gallons: Math.ceil((squareFootage / 125) * 1.5 * 2),
        cost: Math.ceil((squareFootage / 125) * 1.5 * 2) * (prices.colorCoating || 0)
      },
      fiberglassMesh: surfaces.fiberglassMesh?.needed ? {
        area: surfaces.fiberglassMesh.area || 0,
        rolls: Math.ceil((surfaces.fiberglassMesh.area || 0) / 320),
        primerGallons: Math.ceil((surfaces.fiberglassMesh.area || 0) / 75),
        cost: Math.ceil((surfaces.fiberglassMesh.area || 0) / 320) * (prices.fiberglassMesh || 0) +
              Math.ceil((surfaces.fiberglassMesh.area || 0) / 75) * (prices.fiberglassPrimer || 0)
      } : null,
      cushionSystem: surfaces.cushionSystem?.needed ? {
        area: surfaces.cushionSystem.area || 0,
        baseCoatGallons: Math.ceil((surfaces.cushionSystem.area || 0) / 100),
        finishCoatGallons: Math.ceil((surfaces.cushionSystem.area || 0) / 100),
        cost: Math.ceil((surfaces.cushionSystem.area || 0) / 100) *
              ((prices.cushionBaseCoat || 0) + (prices.cushionFinishCoat || 0))
      } : null
    };
  }, [projectData, globalPricing]);
};
