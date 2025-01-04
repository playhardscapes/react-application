 
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

// src/hooks/usePricingData.js
import { useState, useEffect } from 'react';

export const usePricingData = () => {
  const [pricingData, setPricingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/load-pricing');
        if (!response.ok) throw new Error('Failed to load pricing data');
        const data = await response.json();
        setPricingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPricing();
  }, []);

  const savePricing = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/save-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save pricing data');
      setPricingData(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    pricingData,
    isLoading,
    error,
    savePricing
  };
};

// src/hooks/useGeocoding.js
import { useState } from 'react';
import loadGoogleMapsAPI from '@/utils/loadGoogleMapsAPI';

export const useGeocoding = () => {
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDistance = async (destination) => {
    if (!destination) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/mileage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'Roanoke, VA',
          destination
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate distance');
      }

      const data = await response.json();
      setDistance(data.distanceInMiles);
      return data.distanceInMiles;
    } catch (err) {
      setError(err.message);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    distance,
    isLoading,
    error,
    calculateDistance
  };
};
