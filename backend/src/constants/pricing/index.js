 
// src/constants/pricing/index.js

// Materials Pricing
const MATERIALS_PRICING = {
  cpb: 150,              // Concrete patch binder
  sand: 12,              // Price per bag
  cement: 96,            // Price per bag/unit
  minorCracks: 45,       // Price per gallon
  majorCracks: 65,       // Price per gallon
  acrylicResurfacer: 25, // Price per gallon
  colorCoating: 28,      // Price per gallon
  fiberglassMesh: 0.50,  // Price per sq ft
  cushionSystem: 0.75    // Price per sq ft
};

// Services Pricing
const SERVICES_PRICING = {
  acidWash: 0.50,           // Price per sq ft
  holeCutting: 150,         // Price per hole
  generalLabor: 65,         // Price per hour
  windscreenInstallation: 2 // Price per linear foot
};

// Equipment Pricing
const EQUIPMENT_PRICING = {
  posts: {
    tennis: {
      price: 500,
      installationTime: 2
    },
    pickleball: {
      price: 405,
      installationTime: 1.5
    },
    mobilePickleball: {
      price: 400,
      installationTime: 0
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
      pricePerFoot: 100
    }
  },
  windscreen: {
    lowGrade: {
      price: 3.45,
      installationTime: 0.1
    },
    highGrade: {
      price: 5.19,
      installationTime: 0.1
    }
  },
  installation: {
    holeCutting: 500,
    laborRate: 50,
    concretePerHole: 45
  }
};

// Combined default pricing configuration
const defaultPricingConfig = {
  materials: MATERIALS_PRICING,
  equipment: EQUIPMENT_PRICING,
  services: SERVICES_PRICING
};

module.exports = {
  MATERIALS_PRICING,
  SERVICES_PRICING,
  EQUIPMENT_PRICING,
  defaultPricingConfig
};
