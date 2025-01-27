// src/hooks/useEquipmentCosts.js
import { usePricing } from './usePricing';

export const useEquipmentCosts = (data) => {
  const { getPriceByName } = usePricing();

  const calculateTennisCosts = () => {
    if (!data.tennis_post_sets) return { equipment: 0, installation: 0, total: 0 };

    const equipmentCost = data.tennis_post_sets * getPriceByName('Tennis Posts and Net');
    const installationCost = data.tennis_posts_installation ? 
      data.tennis_post_sets * getPriceByName('Tennis Net Footer - Cut, Dig, Fill (2)') : 0;

    return {
      equipment: equipmentCost,
      installation: installationCost,
      total: equipmentCost + installationCost,
      sets: data.tennis_post_sets
    };
  };

  const calculatePickleballCosts = () => {
    const permanentPosts = {
      equipment: data.pickleball_post_sets * getPriceByName('Pickleball Posts and Net'),
      installation: data.pickleball_posts_installation ?
        data.pickleball_post_sets * getPriceByName('Pickleball Net Footer - Cut, Dig, Fill (2)') : 0,
      sets: data.pickleball_post_sets
    };
    permanentPosts.total = permanentPosts.equipment + permanentPosts.installation;

    const mobileNets = {
      equipment: data.mobile_pickleball_nets * getPriceByName('Mobile Pickleball Nets'),
      count: data.mobile_pickleball_nets
    };

    return {
      permanentPosts,
      mobileNets,
      total: permanentPosts.total + mobileNets.equipment
    };
  };

  const calculateBasketballCosts = () => {
    let equipment = 0;
    let installation = 0;
    const details = {
      hoops: {
        'adjustable-60': {
          count: data.basketball_60_count || 0,
          cost: (data.basketball_60_count || 0) * getPriceByName('Adjustable Basketball Hoop 60"')
        },
        'adjustable-72': {
          count: data.basketball_72_count || 0,
          cost: (data.basketball_72_count || 0) * getPriceByName('Adjustable Basketball Hoop 72"')
        },
        'fixed': {
          count: data.basketball_fixed_count || 0,
          cost: (data.basketball_fixed_count || 0) * getPriceByName('Fixed Height Hoop')
        }
      }
    };

    // Sum up equipment costs
    equipment = Object.values(details.hoops).reduce((sum, hoop) => sum + hoop.cost, 0);

    // Calculate installation if needed
    if (data.basketball_installation) {
      const totalHoops = Object.values(details.hoops)
        .reduce((sum, hoop) => sum + hoop.count, 0);
      installation = totalHoops * getPriceByName('Basketball Hoop Footer - Cut, Dig, Fill (1)');
    }

    return {
      equipment,
      installation,
      total: equipment + installation,
      details
    };
  };

  const calculateWindscreenCosts = () => {
    const standardWindscreen = {
      length: data.standard_windscreen || 0,
      equipment: (data.standard_windscreen || 0) * getPriceByName('Windscreen')
    };

    const highGradeWindscreen = {
      length: data.high_grade_windscreen || 0,
      equipment: (data.high_grade_windscreen || 0) * getPriceByName('High Grade Windscreen')
    };

    const installation = data.windscreen_installation ?
      (standardWindscreen.length + highGradeWindscreen.length) * 
      getPriceByName('Windscreen Installation Cost') : 0;

    return {
      standard: standardWindscreen,
      highGrade: highGradeWindscreen,
      installation,
      total: standardWindscreen.equipment + highGradeWindscreen.equipment + installation
    };
  };

  return {
    tennis: calculateTennisCosts(),
    pickleball: calculatePickleballCosts(),
    basketball: calculateBasketballCosts(),
    windscreen: calculateWindscreenCosts(),
    total: calculateTennisCosts().total + 
           calculatePickleballCosts().total + 
           calculateBasketballCosts().total + 
           calculateWindscreenCosts().total
  };
};