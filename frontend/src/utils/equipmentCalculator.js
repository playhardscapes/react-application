// src/utils/equipmentCalculator.js
import { EQUIPMENT_PRICING } from '../constants/pricing/equipment';

export class EquipmentCalculator {
  constructor(equipmentData) {
    this.data = equipmentData || {};
  }

  calculateBasketballCosts() {
    // Ensure systems is an array
    const systems = Array.isArray(this.data.basketball_systems) ?
      this.data.basketball_systems : [];

    const costs = systems.map(system => {
      const baseSystem = EQUIPMENT_PRICING.basketball.systems[system.type || 'adjustable'][system.mounted || 'ground'];
      const extensionCost = ((system.extension || 4) - 4) * EQUIPMENT_PRICING.basketball.extensions.pricePerFoot;

      return {
        equipment: baseSystem.price + Math.max(0, extensionCost),
        installation: baseSystem.installationTime * EQUIPMENT_PRICING.installation.laborRate,
        holes: system.mounted === 'ground' ? EQUIPMENT_PRICING.installation.holeCutting : 0,
        concrete: system.mounted === 'ground' ? EQUIPMENT_PRICING.installation.concretePerHole : 0
      };
    });

    return {
      systems: costs,
      total: costs.reduce((sum, cost) =>
        sum + cost.equipment + cost.installation + cost.holes + cost.concrete, 0)
    };
  }

  calculatePostCosts() {
    const tennisSets = Number(this.data.permanent_tennis_poles) || 0;
    const pickleballSets = Number(this.data.permanent_pickleball_poles) || 0;
    const mobileNets = Number(this.data.mobile_pickleball_nets) || 0;

    return {
      tennis: {
        equipment: tennisSets * EQUIPMENT_PRICING.posts.tennis.price,
        installation: tennisSets * EQUIPMENT_PRICING.posts.tennis.installationTime *
                     EQUIPMENT_PRICING.installation.laborRate,
        holes: tennisSets * 2 * EQUIPMENT_PRICING.installation.holeCutting,
        concrete: tennisSets * 2 * EQUIPMENT_PRICING.installation.concretePerHole
      },
      pickleball: {
        equipment: pickleballSets * EQUIPMENT_PRICING.posts.pickleball.price,
        installation: pickleballSets * EQUIPMENT_PRICING.posts.pickleball.installationTime *
                     EQUIPMENT_PRICING.installation.laborRate,
        holes: pickleballSets * 2 * EQUIPMENT_PRICING.installation.holeCutting,
        concrete: pickleballSets * 2 * EQUIPMENT_PRICING.installation.concretePerHole
      },
      mobilePickleball: {
        equipment: mobileNets * EQUIPMENT_PRICING.posts.mobilePickleball.price,
        installation: 0
      }
    };
  }

  calculateWindscreenCosts() {
    const lowGrade = Number(this.data.low_grade_windscreen) || 0;
    const highGrade = Number(this.data.high_grade_windscreen) || 0;

    return {
      lowGrade: {
        equipment: lowGrade * EQUIPMENT_PRICING.windscreen.lowGrade.price,
        installation: lowGrade * EQUIPMENT_PRICING.windscreen.lowGrade.installationTime *
                     EQUIPMENT_PRICING.installation.laborRate
      },
      highGrade: {
        equipment: highGrade * EQUIPMENT_PRICING.windscreen.highGrade.price,
        installation: highGrade * EQUIPMENT_PRICING.windscreen.highGrade.installationTime *
                     EQUIPMENT_PRICING.installation.laborRate
      }
    };
  }

  calculateTotalCosts() {
    const postCosts = this.calculatePostCosts();
    const basketballCosts = this.calculateBasketballCosts();
    const windscreenCosts = this.calculateWindscreenCosts();

    // Calculate grand totals
    const equipmentTotal =
      postCosts.tennis.equipment +
      postCosts.pickleball.equipment +
      postCosts.mobilePickleball.equipment +
      basketballCosts.total +
      windscreenCosts.lowGrade.equipment +
      windscreenCosts.highGrade.equipment;

    const installationTotal =
      postCosts.tennis.installation +
      postCosts.pickleball.installation +
      postCosts.tennis.holes +
      postCosts.pickleball.holes +
      postCosts.tennis.concrete +
      postCosts.pickleball.concrete +
      windscreenCosts.lowGrade.installation +
      windscreenCosts.highGrade.installation;

    return {
      posts: postCosts,
      basketball: basketballCosts,
      windscreen: windscreenCosts,
      totals: {
        equipment: equipmentTotal,
        installation: installationTotal,
        grandTotal: equipmentTotal + installationTotal
      }
    };
  }
}
