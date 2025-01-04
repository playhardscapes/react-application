 // src/types/project.ts

export interface Dimensions {
  length: number;
  width: number;
  squareFootage: number;
}

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  projectLocation: string;
  distanceToSite: number;
  keyNotes: string;
}

export interface PatchWork {
  needed: boolean;
  estimatedGallons: number;
  minorCrackGallons: number;
  majorCrackGallons: number;
}

export interface FiberglassMesh {
  needed: boolean;
  area: number;
}

export interface CushionSystem {
  needed: boolean;
  area: number;
}

export interface SurfaceSystem {
  needsPressureWash: boolean;
  needsAcidWash: boolean;
  patchWork: PatchWork;
  fiberglassMesh: FiberglassMesh;
  cushionSystem: CushionSystem;
  topCoat: {
    numberOfColors: number;
    colorNotes: string;
  };
}

export interface CourtColors {
  court?: string;
  kitchen?: string;
}

export interface SportCourt {
  selected: boolean;
  courtCount?: number;
  courtType?: 'full' | 'half';  // For basketball
  colors: CourtColors;
}

export interface CourtConfiguration {
  sports: {
    tennis?: SportCourt;
    pickleball?: SportCourt;
    basketball?: SportCourt;
  };
  apron: {
    color: string;
  };
}

export interface Equipment {
  permanentTennisPoles: number;
  permanentPickleballPoles: number;
  mobilePickleballNets: number;
  lowGradeWindscreen: number;
  highGradeWindscreen: number;
}

export interface Logistics {
  travelDays: number;
  numberOfTrips: number;
  generalLaborHours: number;
  hotelRate: number;
  logisticalNotes: string;
}

export interface ProjectData {
  clientInfo: ClientInfo;
  dimensions: Dimensions;
  substrate: {
    type: 'new-concrete' | 'existing-concrete' | 'asphalt';
    dimensions: Dimensions;
    notes: string;
  };
  surfaceSystem: SurfaceSystem;
  courtConfig: CourtConfiguration;
  equipment: Equipment;
  logistics: Logistics;
}

// Helper function to create empty project data
export const createEmptyProjectData = (): ProjectData => ({
  clientInfo: {
    name: '',
    email: '',
    phone: '',
    projectLocation: '',
    distanceToSite: 0,
    keyNotes: ''
  },
  dimensions: {
    length: 0,
    width: 0,
    squareFootage: 0
  },
  substrate: {
    type: 'existing-concrete',
    dimensions: {
      length: 0,
      width: 0,
      squareFootage: 0
    },
    notes: ''
  },
  surfaceSystem: {
    needsPressureWash: true,
    needsAcidWash: false,
    patchWork: {
      needed: false,
      estimatedGallons: 0,
      minorCrackGallons: 0,
      majorCrackGallons: 0
    },
    fiberglassMesh: {
      needed: false,
      area: 0
    },
    cushionSystem: {
      needed: false,
      area: 0
    },
    topCoat: {
      numberOfColors: 1,
      colorNotes: ''
    }
  },
  courtConfig: {
    sports: {},
    apron: {
      color: ''
    }
  },
  equipment: {
    permanentTennisPoles: 0,
    permanentPickleballPoles: 0,
    mobilePickleballNets: 0,
    lowGradeWindscreen: 0,
    highGradeWindscreen: 0
  },
  logistics: {
    travelDays: 2,
    numberOfTrips: 1,
    generalLaborHours: 0,
    hotelRate: 150,
    logisticalNotes: ''
  }
});

