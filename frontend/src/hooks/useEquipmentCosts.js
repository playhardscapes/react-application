// src/hooks/useEquipmentCosts.js
import { useMemo } from 'react';

export const useEquipmentCosts = (equipment, pricing) => {
  return useMemo(() => {
    if (!equipment || !pricing) return {};

    const posts = {
      tennis: {
        equipment: (equipment.permanentTennisPoles || 0) * (pricing.equipment?.permanentTennisPoles || 0),
        installation: (equipment.permanentTennisPoles || 0) * (pricing.services?.holeCutting || 0) * 2
      },
      pickleball: {
        equipment: (equipment.permanentPickleballPoles || 0) * (pricing.equipment?.permanentPickleballPoles || 0),
        installation: (equipment.permanentPickleballPoles || 0) * (pricing.services?.holeCutting || 0) * 2
      }
    };

    const windscreen = {
      lowGrade: {
        feet: equipment.lowGradeWindscreen || 0,
        cost: (equipment.lowGradeWindscreen || 0) * (pricing.equipment?.lowGradeWindscreen || 0)
      },
      highGrade: {
        feet: equipment.highGradeWindscreen || 0,
        cost: (equipment.highGradeWindscreen || 0) * (pricing.equipment?.highGradeWindscreen || 0)
      }
    };

    return {
      posts,
      windscreen,
      total: posts.tennis.equipment + posts.tennis.installation +
             posts.pickleball.equipment + posts.pickleball.installation +
             windscreen.lowGrade.cost + windscreen.highGrade.cost
    };
  }, [equipment, pricing]);
};
