// src/hooks/useSurfacePrepCosts.js
import { usePricing } from './usePricing';

export const useSurfacePrepCosts = (data) => {
  const { getPriceByName } = usePricing();

  const calculateCost = (type) => {
    if (!data.square_footage) return 0;
    
    switch(type) {
      case 'pressure':
        return data.square_footage * getPriceByName('Pressure Washing');
      case 'acid':
        return data.square_footage * getPriceByName('Acid Wash (Concrete Only)');
      case 'patch':
        return (data.patch_work_gallons || 0) * getPriceByName('Court Patch Binder - Materials');
      case 'minor_crack':
        return (data.minor_crack_gallons || 0) * getPriceByName('Minor Crack Repair (Filling and Sealing)');
      case 'major_crack':
        return (data.major_crack_gallons || 0) * getPriceByName('Major Crack Repair (Filling and Sealing)');
      case 'fiberglass_install':
        return (data.fiberglass_mesh_area || 0) * getPriceByName('Fiberglass Mesh System Installation');
      case 'fiberglass_material':
        return (data.fiberglass_mesh_area || 0) * getPriceByName('Fiberglass Mesh System Materials');
      case 'cushion_install':
        return (data.cushion_system_area || 0) * getPriceByName('Cushion System Installation');
      case 'cushion_material':
        return (data.cushion_system_area || 0) * getPriceByName('Cushion System Materials');
      default:
        return 0;
    }
  };

  const surfacePrep = {
    pressureWash: data.needs_pressure_wash ? calculateCost('pressure') : 0,
    acidWash: data.needs_acid_wash ? calculateCost('acid') : 0,
    patchWork: {
      materials: calculateCost('patch'),
      minorCracks: calculateCost('minor_crack'),
      majorCracks: calculateCost('major_crack'),
      total: calculateCost('patch') + calculateCost('minor_crack') + calculateCost('major_crack')
    },
    fiberglassMesh: data.fiberglass_mesh_needed ? {
      installation: calculateCost('fiberglass_install'),
      materials: calculateCost('fiberglass_material'),
      total: calculateCost('fiberglass_install') + calculateCost('fiberglass_material'),
      area: data.fiberglass_mesh_area || 0
    } : null,
    cushionSystem: data.cushion_system_needed ? {
      installation: calculateCost('cushion_install'),
      materials: calculateCost('cushion_material'),
      total: calculateCost('cushion_install') + calculateCost('cushion_material'),
      area: data.cushion_system_area || 0
    } : null
  };

  // Calculate subtotals
  surfacePrep.subtotals = {
    prep: surfacePrep.pressureWash + surfacePrep.acidWash,
    patchWork: surfacePrep.patchWork.total,
    additionalSystems: (surfacePrep.fiberglassMesh?.total || 0) + 
                      (surfacePrep.cushionSystem?.total || 0)
  };

  // Calculate total
  surfacePrep.total = surfacePrep.subtotals.prep + 
                     surfacePrep.subtotals.patchWork + 
                     surfacePrep.subtotals.additionalSystems;

  return surfacePrep;
};