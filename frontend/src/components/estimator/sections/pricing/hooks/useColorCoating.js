// pricing/hooks/useLinePainting.js
import { useMemo } from 'react';

export const useLinePainting = (projectData, globalPricing) => {
  return useMemo(() => {
    const courts = projectData.courtConfig?.sports || {};
    const services = globalPricing?.services || {};
    let lineCosts = {};
    let totalCost = 0;

    // Tennis Courts
    if (courts.tennis?.selected) {
      const courtCount = courts.tennis?.courtCount || 0;
      const costPerCourt = services.linePaintingTennis || 0;
      const tennisCost = courtCount * costPerCourt;
      totalCost += tennisCost;
      lineCosts.tennis = {
        courts: courtCount,
        costPerCourt,
        totalCost: tennisCost
      };
    }

    // Pickleball Courts
    if (courts.pickleball?.selected) {
      const courtCount = courts.pickleball?.courtCount || 0;
      const costPerCourt = services.linePaintingPickleball || 0;
      const pickleballCost = courtCount * costPerCourt;
      totalCost += pickleballCost;
      lineCosts.pickleball = {
        courts: courtCount,
        costPerCourt,
        totalCost: pickleballCost
      };
    }

    // Basketball Court
    if (courts.basketball?.selected) {
      const isFullCourt = courts.basketball?.courtType === 'full';
      const costPerCourt = isFullCourt ?
        (services.linePaintingFullBasketball || 0) :
        (services.linePaintingHalfBasketball || 0);
      const basketballCost = costPerCourt;
      totalCost += basketballCost;
      lineCosts.basketball = {
        type: isFullCourt ? 'Full Court' : 'Half Court',
        costPerCourt,
        totalCost: basketballCost
      };
    }

    return {
      lineCosts,
      totalCost
    };
  }, [projectData, globalPricing]);
};
