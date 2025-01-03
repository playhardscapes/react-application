// pricing/hooks/useEquipmentCosts.js
import { useMemo } from 'react';

export const useEquipmentCosts = (projectData, globalPricing) => {
  return useMemo(() => {
    const equipment = projectData.equipment || {};
    const prices = globalPricing?.equipment || {};

    const costs = {
      tennis: {
        quantity: equipment.permanentTennisPoles || 0,
        cost: (equipment.permanentTennisPoles || 0) * (prices.permanentTennisPoles || 0)
      },
      pickleball: {
        posts: {
          quantity: equipment.permanentPickleballPoles || 0,
          cost: (equipment.permanentPickleballPoles || 0) * (prices.permanentPickleballPoles || 0)
        },
        mobileNets: {
          quantity: equipment.mobilePickleballNets || 0,
          cost: (equipment.mobilePickleballNets || 0) * (prices.mobilePickleballNets || 0)
        }
      },
      windscreen: {
        lowGrade: {
          feet: equipment.lowGradeWindscreen || 0,
          cost: (equipment.lowGradeWindscreen || 0) * (prices.lowGradeWindscreen || 0)
        },
        highGrade: {
          feet: equipment.highGradeWindscreen || 0,
          cost: (equipment.highGradeWindscreen || 0) * (prices.highGradeWindscreen || 0)
        }
      }
    };

    const total = costs.tennis.cost +
                 costs.pickleball.posts.cost +
                 costs.pickleball.mobileNets.cost +
                 costs.windscreen.lowGrade.cost +
                 costs.windscreen.highGrade.cost;

    return {
      ...costs,
      total
    };
  }, [projectData, globalPricing]);
};
