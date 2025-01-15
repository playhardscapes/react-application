// src/hooks/useEquipmentCosts.js
import { useMemo } from 'react';

export const useEquipmentCosts = (estimateData, pricing) => {
  return useMemo(() => {
    if (!estimateData || !pricing?.equipment) return { total: 0 };

    // Ensure we have the required pricing structures
    const equipment = pricing.equipment || {};
    const services = pricing.services || {};
    
    // Add some debug logging
    console.log('Equipment pricing:', equipment);
    console.log('Services pricing:', services);

    // Tennis posts calculation
    const tennisPosts = {
      equipment: (estimateData.permanent_tennis_poles || 0) * (equipment.posts?.tennis?.price || 0),
      installation: (estimateData.permanent_tennis_poles || 0) * (equipment.posts?.tennis?.installationTime || 0) *
                   (equipment.installation?.laborRate || 0),
      holes: (estimateData.permanent_tennis_poles || 0) * 2 * (equipment.installation?.holeCutting || 0),
      concrete: (estimateData.permanent_tennis_poles || 0) * 2 * (equipment.installation?.concretePerHole || 0),
      total: 0
    };
    tennisPosts.total = tennisPosts.equipment + tennisPosts.installation + tennisPosts.holes + tennisPosts.concrete;

    // Pickleball equipment calculation
    const pickleballPosts = {
      equipment: (estimateData.permanent_pickleball_poles || 0) * (equipment.posts?.pickleball?.price || 0),
      installation: (estimateData.permanent_pickleball_poles || 0) * (equipment.posts?.pickleball?.installationTime || 0) *
                   (equipment.installation?.laborRate || 0),
      holes: (estimateData.permanent_pickleball_poles || 0) * 2 * (equipment.installation?.holeCutting || 0),
      concrete: (estimateData.permanent_pickleball_poles || 0) * 2 * (equipment.installation?.concretePerHole || 0),
      total: 0
    };
    pickleballPosts.total = pickleballPosts.equipment + pickleballPosts.installation + pickleballPosts.holes + pickleballPosts.concrete;

    // Mobile pickleball nets
    const mobilePickleball = {
      equipment: (estimateData.mobile_pickleball_nets || 0) * (equipment.posts?.mobilePickleball?.price || 0),
      total: 0
    };
    mobilePickleball.total = mobilePickleball.equipment;

    // Windscreen calculation
    const windscreen = {
      lowGrade: {
        equipment: (estimateData.low_grade_windscreen || 0) * (equipment.windscreen?.lowGrade?.price || 0),
        installation: (estimateData.low_grade_windscreen || 0) * (equipment.windscreen?.lowGrade?.installationTime || 0) *
                     (equipment.installation?.laborRate || 0),
        total: 0
      },
      highGrade: {
        equipment: (estimateData.high_grade_windscreen || 0) * (equipment.windscreen?.highGrade?.price || 0),
        installation: (estimateData.high_grade_windscreen || 0) * (equipment.windscreen?.highGrade?.installationTime || 0) *
                     (equipment.installation?.laborRate || 0),
        total: 0
      }
    };
    windscreen.lowGrade.total = windscreen.lowGrade.equipment + windscreen.lowGrade.installation;
    windscreen.highGrade.total = windscreen.highGrade.total + windscreen.highGrade.installation;

    // Basketball systems calculation
    let basketballSystems = [];
    // Ensure basketball_systems is an array before processing
    if (Array.isArray(estimateData.basketball_systems)) {
      basketballSystems = estimateData.basketball_systems.map(system => {
        const baseSystem = equipment.basketball?.systems?.[system.type || 'adjustable']?.[system.mounted || 'ground'] || {};
        const extensionCost = ((system.extension || 4) - 4) * (equipment.basketball?.extensions?.pricePerFoot || 0);

        return {
          equipment: (baseSystem.price || 0) + extensionCost,
          installation: (baseSystem.installationTime || 0) * (equipment.installation?.laborRate || 0),
          holes: system.mounted === 'ground' ? (equipment.installation?.holeCutting || 0) : 0,
          concrete: system.mounted === 'ground' ? (equipment.installation?.concretePerHole || 0) : 0
        };
      });
    }

    const basketballTotal = basketballSystems.reduce((sum, system) =>
      sum + system.equipment + system.installation + system.holes + system.concrete, 0);

    // Calculate grand total
    const grandTotal =
      tennisPosts.total +
      pickleballPosts.total +
      mobilePickleball.total +
      windscreen.lowGrade.total +
      windscreen.highGrade.total +
      basketballTotal;

    return {
      posts: {
        tennis: tennisPosts,
        pickleball: pickleballPosts,
        mobilePickleball: mobilePickleball
      },
      windscreen,
      basketball: {
        systems: basketballSystems,
        total: basketballTotal
      },
      total: grandTotal
    };
  }, [estimateData, pricing]);
};