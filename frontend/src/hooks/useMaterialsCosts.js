// src/hooks/useMaterialsCosts.js
import { useMemo } from 'react';
import { COURT_DIMENSIONS } from '@/constants/courts';

export const useMaterialsCosts = (estimateData, pricing) => {
  return useMemo(() => {
    if (!estimateData || !pricing) {
      return {
        details: {},
        subtotals: {},
        total: 0
      };
    }

    // Ensure we have the required pricing structures
    const materials = pricing.materials || {};
    const services = pricing.services || {};
    
    // Add some debug logging
    console.log('Materials pricing:', materials);
    console.log('Services pricing:', services);

    // Use square footage or calculate from dimensions
    const squareFootage = estimateData.square_footage ||
                          (estimateData.length * estimateData.width) || 0;

    // Acid Wash Calculation
    const acidWashCost = estimateData.needs_acid_wash ?
      squareFootage * (services.acidWash || 0) : 0;

    // Resurfacer Calculation
    const resurfacer = {
      gallonsNeeded: Math.ceil((squareFootage / 125) * 1.5 * 2),
      drumsRequired: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30),
      cost: Math.ceil((squareFootage / 125) * 1.5 * 2 / 30) *
            ((materials.acrylicResurfacer || 0) * 30)
    };

    // Patch Work Calculation
    const patchWork = estimateData.patch_work_needed ? {
      binder: {
        gallons: estimateData.patch_work_gallons || 0,
        cost: (estimateData.patch_work_gallons / 5) * (materials.cpb || 0)
      },
      crackFiller: {
        minor: {
          gallons: estimateData.minor_crack_gallons || 0,
          cost: (estimateData.minor_crack_gallons || 0) * (materials.minorCracks || 0)
        },
        major: {
          gallons: estimateData.major_crack_gallons || 0,
          cost: (estimateData.major_crack_gallons || 0) * (materials.majorCracks || 0)
        }
      }
    } : null;

    // Fiberglass Calculation
    const fiberglass = estimateData.fiberglass_mesh_needed ? {
      area: estimateData.fiberglass_mesh_area || 0,
      cost: (estimateData.fiberglass_mesh_area || 0) * (materials.fiberglassMesh || 0)
    } : null;

    // Cushion System Calculation
    const cushion = estimateData.cushion_system_needed ? {
      area: estimateData.cushion_system_area || 0,
      cost: (estimateData.cushion_system_area || 0) * (materials.cushionSystem || 0)
    } : null;

    const subtotals = {
      acidWash: acidWashCost,
      patchWork: patchWork ? (
        patchWork.binder.cost +
        patchWork.crackFiller.minor.cost +
        patchWork.crackFiller.major.cost
      ) : 0,
      resurfacer: resurfacer.cost,
      colorCoating: (squareFootage / 125) * 1.5 * 2 * (materials.colorCoating || 0),
      fiberglass: fiberglass?.cost || 0,
      cushion: cushion?.cost || 0
    };

    return {
      details: {
        acidWash: { cost: acidWashCost },
        patchWork,
        resurfacer,
        colorCoating: {
          gallonsNeeded: Math.ceil((squareFootage / 125) * 1.5 * 2),
          cost: subtotals.colorCoating
        },
        fiberglass,
        cushion
      },
      subtotals,
      total: Object.values(subtotals).reduce((sum, cost) => sum + cost, 0)
    };
  }, [estimateData, pricing]);
};