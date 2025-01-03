 
// src/constants/equipmentPricing.js

export const EQUIPMENT_PRICING = {
  posts: {
    tennis: {
      price: 500,          // Price per set
      installationTime: 2  // Hours per set
    },
    pickleball: {
      price: 405,
      installationTime: 1.5
    },
    mobilePickleball: {
      price: 400,          // Price per net
      installationTime: 0  // No installation needed
    }
  },
  basketball: {
    systems: {
      adjustable: {
        ground: {
          price: 1500,
          installationTime: 4
        },
        wall: {
          price: 1200,
          installationTime: 3
        }
      },
      fixed: {
        ground: {
          price: 1200,
          installationTime: 3
        },
        wall: {
          price: 900,
          installationTime: 2
        }
      }
    },
    extensions: {
      // Price per foot of extension beyond standard
      pricePerFoot: 100
    }
  },
  windscreen: {
    lowGrade: {
      price: 3.45,        // Price per linear foot
      installationTime: 0.1  // Hours per linear foot
    },
    highGrade: {
      price: 5.19,
      installationTime: 0.1
    }
  },
  installation: {
    holeCutting: 500,     // Price per hole
    laborRate: 50,        // Per hour
    concretePerHole: 45   // Cost of concrete per hole
  }
};

// src/utils/equipmentCalculator.js
import { EQUIPMENT_PRICING } from '../constants/equipmentPricing';

export class EquipmentCalculator {
  constructor(equipmentData) {
    this.data = equipmentData;
  }

  calculatePostCosts() {
    const tennisSets = this.data.permanentTennisPoles || 0;
    const pickleballSets = this.data.permanentPickleballPoles || 0;
    const mobileNets = this.data.mobilePickleballNets || 0;

    return {
      tennis: {
        equipment: tennisSets * EQUIPMENT_PRICING.posts.tennis.price,
        installation: tennisSets * EQUIPMENT_PRICING.posts.tennis.installationTime * EQUIPMENT_PRICING.installation.laborRate,
        holes: tennisSets * 2 * EQUIPMENT_PRICING.installation.holeCutting,
        concrete: tennisSets * 2 * EQUIPMENT_PRICING.installation.concretePerHole
      },
      pickleball: {
        equipment: pickleballSets * EQUIPMENT_PRICING.posts.pickleball.price,
        installation: pickleballSets * EQUIPMENT_PRICING.posts.pickleball.installationTime * EQUIPMENT_PRICING.installation.laborRate,
        holes: pickleballSets * 2 * EQUIPMENT_PRICING.installation.holeCutting,
        concrete: pickleballSets * 2 * EQUIPMENT_PRICING.installation.concretePerHole
      },
      mobilePickleball: {
        equipment: mobileNets * EQUIPMENT_PRICING.posts.mobilePickleball.price,
        installation: 0
      }
    };
  }

  calculateBasketballCosts() {
    const systems = this.data.basketballSystems || [];
    return systems.map(system => {
      const baseSystem = EQUIPMENT_PRICING.basketball.systems[system.type][system.mounted];
      const extensionCost = (system.extension - 4) * EQUIPMENT_PRICING.basketball.extensions.pricePerFoot;

      return {
        equipment: baseSystem.price + Math.max(0, extensionCost),
        installation: baseSystem.installationTime * EQUIPMENT_PRICING.installation.laborRate,
        holes: system.mounted === 'ground' ? EQUIPMENT_PRICING.installation.holeCutting : 0,
        concrete: system.mounted === 'ground' ? EQUIPMENT_PRICING.installation.concretePerHole : 0
      };
    });
  }

  calculateWindscreenCosts() {
    const lowGrade = this.data.lowGradeWindscreen || 0;
    const highGrade = this.data.highGradeWindscreen || 0;

    return {
      lowGrade: {
        equipment: lowGrade * EQUIPMENT_PRICING.windscreen.lowGrade.price,
        installation: lowGrade * EQUIPMENT_PRICING.windscreen.lowGrade.installationTime * EQUIPMENT_PRICING.installation.laborRate
      },
      highGrade: {
        equipment: highGrade * EQUIPMENT_PRICING.windscreen.highGrade.price,
        installation: highGrade * EQUIPMENT_PRICING.windscreen.highGrade.installationTime * EQUIPMENT_PRICING.installation.laborRate
      }
    };
  }

  calculateTotalCosts() {
    const postCosts = this.calculatePostCosts();
    const basketballCosts = this.calculateBasketballCosts();
    const windscreenCosts = this.calculateWindscreenCosts();

    // Sum up all equipment costs
    const equipmentTotal =
      postCosts.tennis.equipment +
      postCosts.pickleball.equipment +
      postCosts.mobilePickleball.equipment +
      basketballCosts.reduce((sum, system) => sum + system.equipment, 0) +
      windscreenCosts.lowGrade.equipment +
      windscreenCosts.highGrade.equipment;

    // Sum up all installation costs
    const installationTotal =
      postCosts.tennis.installation +
      postCosts.pickleball.installation +
      postCosts.tennis.holes +
      postCosts.pickleball.holes +
      postCosts.tennis.concrete +
      postCosts.pickleball.concrete +
      basketballCosts.reduce((sum, system) => sum + system.installation + system.holes + system.concrete, 0) +
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
      },
      details: {
        totalHoles: this.calculateTotalHoles(),
        totalInstallationHours: this.calculateTotalInstallationHours()
      }
    };
  }

  calculateTotalHoles() {
    const posts = (this.data.permanentTennisPoles || 0) * 2 +
                 (this.data.permanentPickleballPoles || 0) * 2;
    const basketball = (this.data.basketballSystems || [])
      .filter(system => system.mounted === 'ground')
      .length;

    return posts + basketball;
  }

  calculateTotalInstallationHours() {
    const posts =
      ((this.data.permanentTennisPoles || 0) * EQUIPMENT_PRICING.posts.tennis.installationTime) +
      ((this.data.permanentPickleballPoles || 0) * EQUIPMENT_PRICING.posts.pickleball.installationTime);

    const basketball = (this.data.basketballSystems || [])
      .reduce((sum, system) => sum + EQUIPMENT_PRICING.basketball.systems[system.type][system.mounted].installationTime, 0);

    const windscreen =
      ((this.data.lowGradeWindscreen || 0) * EQUIPMENT_PRICING.windscreen.lowGrade.installationTime) +
      ((this.data.highGradeWindscreen || 0) * EQUIPMENT_PRICING.windscreen.highGrade.installationTime);

    return posts + basketball + windscreen;
  }
}
