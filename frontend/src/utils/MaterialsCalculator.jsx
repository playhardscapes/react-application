 
// src/utils/materialsCalculator.js

export class MaterialsCalculator {
  constructor(surfaceData, dimensions, pricing) {
    this.data = surfaceData;
    this.dimensions = dimensions;
    this.pricing = pricing;
    this.squareFootage = dimensions?.squareFootage || 0;
  }

  calculatePatchWork() {
    if (!this.data.patchWork?.needed) return null;

    const gallons = this.data.patchWork.estimatedGallons || 0;
    const sandBags = Math.ceil(gallons / 3 * 2); // 2 bags per 3 gallons of binder
    const cementQuarts = Math.ceil(gallons); // 1 quart per gallon of binder

    return {
      binder: {
        gallons,
        cost: (gallons / 5) * this.pricing.materials.cpb // CPB comes in 5 gal buckets
      },
      sand: {
        bags: sandBags,
        cost: sandBags * this.pricing.materials.sand
      },
      cement: {
        quarts: cementQuarts,
        cost: (cementQuarts / 48) * this.pricing.materials.cement // Cement comes in 48qt sets
      },
      crackFiller: {
        minor: {
          gallons: this.data.patchWork.minorCrackGallons || 0,
          cost: (this.data.patchWork.minorCrackGallons || 0) * this.pricing.materials.minorCracks
        },
        major: {
          gallons: this.data.patchWork.majorCrackGallons || 0,
          cost: (this.data.patchWork.majorCrackGallons || 0) * this.pricing.materials.majorCracks
        }
      }
    };
  }

  calculateResurfacer() {
    // Coverage rate of 125 sq ft per gallon, with 1.5 factor for texture
    const gallonsPerCoat = Math.ceil((this.squareFootage / 125) * 1.5);
    const totalGallons = gallonsPerCoat * 2; // Two coats
    const drumsNeeded = Math.ceil(totalGallons / 30); // 30 gallons per drum

    return {
      gallonsNeeded: totalGallons,
      drumsRequired: drumsNeeded,
      cost: drumsNeeded * (this.pricing.materials.acrylicResurfacer * 30)
    };
  }

  calculateColorCoating() {
    // Same coverage as resurfacer
    const gallonsPerCoat = Math.ceil((this.squareFootage / 125) * 1.5);
    const totalGallons = gallonsPerCoat * 2; // Two coats
    const drumsNeeded = Math.ceil(totalGallons / 30);

    return {
      gallonsNeeded: totalGallons,
      drumsRequired: drumsNeeded,
      cost: drumsNeeded * (this.pricing.materials.colorCoating * 30)
    };
  }

  calculateFiberglassSystem() {
    if (!this.data.fiberglassMesh?.needed) return null;

    const area = this.data.fiberglassMesh.area || 0;
    const rollsNeeded = Math.ceil(area / 320); // 320 sq ft per roll
    const primerGallons = Math.ceil(area / 75); // 75 sq ft per gallon coverage

    return {
      mesh: {
        area,
        rolls: rollsNeeded,
        cost: rollsNeeded * this.pricing.materials.fiberglassMesh
      },
      primer: {
        gallons: primerGallons,
        cost: primerGallons * this.pricing.materials.fiberglassPrimer
      }
    };
  }

  calculateCushionSystem() {
    if (!this.data.cushionSystem?.needed) return null;

    const area = this.data.cushionSystem.area || 0;
    const gallonsPerCoat = Math.ceil(area / 100); // 100 sq ft per gallon

    return {
      baseCoat: {
        gallons: gallonsPerCoat,
        cost: gallonsPerCoat * (this.pricing.materials.cushionBaseCoat || 0)
      },
      finishCoat: {
        gallons: gallonsPerCoat,
        cost: gallonsPerCoat * (this.pricing.materials.cushionFinishCoat || 0)
      }
    };
  }

  calculateTotalCosts() {
    const patchWork = this.calculatePatchWork();
    const resurfacer = this.calculateResurfacer();
    const colorCoating = this.calculateColorCoating();
    const fiberglass = this.calculateFiberglassSystem();
    const cushion = this.calculateCushionSystem();

    // Calculate subtotals
    const patchWorkTotal = patchWork ?
      patchWork.binder.cost +
      patchWork.sand.cost +
      patchWork.cement.cost +
      patchWork.crackFiller.minor.cost +
      patchWork.crackFiller.major.cost : 0;

    const fiberglassTotal = fiberglass ?
      fiberglass.mesh.cost + fiberglass.primer.cost : 0;

    const cushionTotal = cushion ?
      cushion.baseCoat.cost + cushion.finishCoat.cost : 0;

    return {
      details: {
        patchWork,
        resurfacer,
        colorCoating,
        fiberglass,
        cushion
      },
      subtotals: {
        patchWork: patchWorkTotal,
        resurfacer: resurfacer.cost,
        colorCoating: colorCoating.cost,
        fiberglass: fiberglassTotal,
        cushion: cushionTotal
      },
      total: patchWorkTotal +
             resurfacer.cost +
             colorCoating.cost +
             fiberglassTotal +
             cushionTotal
    };
  }
}
