// src/hooks/useMaterialsCosts.js
import { useMemo } from 'react';
import { calculateCoatingGallons } from '@/utils/calculations';

export const useMaterialsCosts = (surfaceSystem, dimensions, pricing) => {
  return useMemo(() => {
    if (!surfaceSystem || !dimensions || !pricing) return {};

    const squareFootage = dimensions.squareFootage || 0;

    // Calculate acid wash costs
    const acidWash = surfaceSystem.needsAcidWash ? {
      area: squareFootage,
      cost: squareFootage * (pricing.services?.acidWash || 0)
    } : null;

    // Calculate patch work costs
    const patchWork = surfaceSystem.patchWork?.needed ? {
      binder: {
        gallons: surfaceSystem.patchWork.estimatedGallons,
        cost: (surfaceSystem.patchWork.estimatedGallons / 5) * (pricing.materials?.cpb || 0)
      },
      sand: {
        bags: Math.ceil(surfaceSystem.patchWork.estimatedGallons / 3 * 2),
        cost: Math.ceil(surfaceSystem.patchWork.estimatedGallons / 3 * 2) * (pricing.materials?.sand || 0)
      },
      cement: {
        quarts: Math.ceil(surfaceSystem.patchWork.estimatedGallons),
        cost: (Math.ceil(surfaceSystem.patchWork.estimatedGallons) / 48) * (pricing.materials?.cement || 0)
      },
      crackFiller: {
        minor: {
          gallons: surfaceSystem.patchWork.minorCrackGallons,
          cost: surfaceSystem.patchWork.minorCrackGallons * (pricing.materials?.minorCracks || 0)
        },
        major: {
          gallons: surfaceSystem.patchWork.majorCrackGallons,
          cost: surfaceSystem.patchWork.majorCrackGallons * (pricing.materials?.majorCracks || 0)
        }
      }
    } : null;

    // Calculate resurfacer costs
    const resurfacer = {
      gallonsNeeded: calculateCoatingGallons(squareFootage),
      drumsRequired: Math.ceil(calculateCoatingGallons(squareFootage) / 30),
      cost: Math.ceil(calculateCoatingGallons(squareFootage) / 30) * ((pricing.materials?.acrylicResurfacer || 0) * 30)
    };

    // Calculate color coating costs
    const colorCoating = {
      gallonsNeeded: calculateCoatingGallons(squareFootage),
      drumsRequired: Math.ceil(calculateCoatingGallons(squareFootage) / 30),
      cost: Math.ceil(calculateCoatingGallons(squareFootage) / 30) * ((pricing.materials?.colorCoating || 0) * 30)
    };

    // Calculate subtotals
    const subtotals = {
      acidWash: acidWash?.cost || 0,
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
        acidWash,
        patchWork,
        resurfacer,
        colorCoating
      },
      subtotals,
      total: Object.values(subtotals).reduce((sum, cost) => sum + cost, 0)
    };
  }, [surfaceSystem, dimensions, pricing]);
};
