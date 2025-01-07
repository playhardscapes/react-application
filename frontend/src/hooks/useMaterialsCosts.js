// src/hooks/useMaterialsCosts.js
import { useMemo } from 'react';

export const useMaterialsCosts = (surfaceSystem, dimensions, pricing) => {
  return useMemo(() => {
    if (!surfaceSystem || !dimensions || !pricing) return {};

    const squareFootage = dimensions.squareFootage || 0;
    
    // Calculate acid wash if needed
    const acidWashCost = surfaceSystem.needsAcidWash ? 
      squareFootage * (pricing.services?.acidWash || 0) : 0;

    // Calculate resurfacer costs
    const resurfacer = {
      gallonsNeeded: Math.ceil((squareFootage / 125) * 1.5 * 2),
      drumsRequired: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30),
      cost: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30) * ((pricing.materials?.acrylicResurfacer || 0) * 30)
    };

    // Calculate color coating costs
    const colorCoating = {
      gallonsNeeded: Math.ceil((squareFootage / 125) * 1.5 * 2),
      drumsRequired: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30),
      cost: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30) * ((pricing.materials?.colorCoating || 0) * 30)
    };

    // Calculate patch work costs
    const patchWork = surfaceSystem.patchWork?.needed ? {
      binder: {
        gallons: surfaceSystem.patchWork.estimatedGallons,
        cost: (surfaceSystem.patchWork.estimatedGallons / 5) * pricing.materials.cpb
      },
      sand: {
        bags: Math.ceil(surfaceSystem.patchWork.estimatedGallons / 3 * 2),
        cost: Math.ceil(surfaceSystem.patchWork.estimatedGallons / 3 * 2) * pricing.materials.sand
      },
      cement: {
        quarts: Math.ceil(surfaceSystem.patchWork.estimatedGallons),
        cost: (Math.ceil(surfaceSystem.patchWork.estimatedGallons) / 48) * pricing.materials.cement
      },
      crackFiller: {
        minor: {
          gallons: surfaceSystem.patchWork.minorCrackGallons,
          cost: surfaceSystem.patchWork.minorCrackGallons * pricing.materials.minorCracks
        },
        major: {
          gallons: surfaceSystem.patchWork.majorCrackGallons,
          cost: surfaceSystem.patchWork.majorCrackGallons * pricing.materials.majorCracks
        }
      }
    } : null;

    // Calculate subtotals
    const subtotals = {
      acidWash: acidWashCost,
      patchWork: patchWork ? (
        patchWork.binder.cost +
        patchWork.sand.cost +
        patchWork.cement.cost +
        patchWork.crackFiller.minor.cost +
        patchWork.crackFiller.major.cost
      ) : 0,
      resurfacer: resurfacer.cost,
      colorCoating: colorCoating.cost
    };

    return {
      details: {
        acidWash: { cost: acidWashCost },
        patchWork,
        resurfacer,
        colorCoating
      },
      subtotals,
      total: Object.values(subtotals).reduce((sum, cost) => sum + cost, 0)
    };
  }, [surfaceSystem, dimensions, pricing]);
};