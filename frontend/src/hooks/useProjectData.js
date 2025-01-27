 // src/hooks/useProjectData.js
import { useState } from 'react';

const INITIAL_STATE = {
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
    type: '',
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
    highGradeWindscreen: 0,
    basketballSystems: []
  },
  logistics: {
    travelDays: 2,
    numberOfTrips: 1,
    generalLaborHours: 0,
    hotelRate: 150,
    logisticalNotes: ''
  }
};

export const useProjectData = () => {
  const [projectData, setProjectData] = useState(INITIAL_STATE);

  const updateSection = (section, data) => {
    setProjectData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const resetProject = () => {
    setProjectData(INITIAL_STATE);
  };

  return {
    projectData,
    updateSection,
    resetProject
  };
};

