// src/hooks/useColorCalculations.js
import { useMemo } from 'react';

const COVERAGE_RATE = 125; // sq ft per gallon
const WASTE_FACTOR = 1.5;
const COATS = 2;

export const useColorCalculations = (projectData, pricing) => {
  return useMemo(() => {
    if (!projectData || !pricing) {
      return {
        resurfacer: {},
        tennis: null,
        pickleball: null,
        basketball: null,
        apron: null,
        colorTotals: {}
      };
    }

    const totalArea = (projectData.length || 0) * (projectData.width || 0);
    console.log('Total project area:', totalArea);

    const calculateGallons = (sqFt) => Math.ceil((sqFt / COVERAGE_RATE) * WASTE_FACTOR * COATS);

    // Calculate total court areas and colors
    let totalCourtArea = 0;

    // Tennis Court Calculations
    const tennis = projectData.tennis_courts > 0 ? {
      area: COURT_DIMENSIONS.tennis.length * COURT_DIMENSIONS.tennis.width * projectData.tennis_courts,
      gallonsNeeded: calculateGallons(
        COURT_DIMENSIONS.tennis.length * COURT_DIMENSIONS.tennis.width * projectData.tennis_courts
      ),
      color: projectData.tennis_court_color
    } : null;

    if (tennis) totalCourtArea += tennis.area;

    // Pickleball Court Calculations
    const pickleball = projectData.pickleball_courts > 0 ? {
      kitchen: {
        area: COURT_DIMENSIONS.pickleball.kitchen.length * 
              COURT_DIMENSIONS.pickleball.kitchen.width *
              projectData.pickleball_courts,
        gallonsNeeded: calculateGallons(
          COURT_DIMENSIONS.pickleball.kitchen.length * 
          COURT_DIMENSIONS.pickleball.kitchen.width *
          projectData.pickleball_courts
        ),
        color: projectData.pickleball_kitchen_color
      },
      court: {
        area: COURT_DIMENSIONS.pickleball.court.length * 
              COURT_DIMENSIONS.pickleball.court.width *
              projectData.pickleball_courts,
        gallonsNeeded: calculateGallons(
          COURT_DIMENSIONS.pickleball.court.length * 
          COURT_DIMENSIONS.pickleball.court.width *
          projectData.pickleball_courts
        ),
        color: projectData.pickleball_court_color
      }
    } : null;

    if (pickleball) {
      totalCourtArea += pickleball.kitchen.area + pickleball.court.area;
    }

    // Calculate resurfacer for total area
    const resurfacer = {
      gallonsNeeded: calculateGallons(totalArea),
      drumsRequired: Math.ceil(calculateGallons(totalArea) / 30),
      cost: Math.ceil(calculateGallons(totalArea) / 30) * 
            ((pricing.materials?.acrylicResurfacer || 0) * 30)
    };

    // Apron (remaining area)
    const apronArea = Math.max(0, totalArea - totalCourtArea);
    const apron = projectData.apron_color ? {
      area: apronArea,
      gallonsNeeded: calculateGallons(apronArea),
      color: projectData.apron_color
    } : null;

    // Calculate totals by color
    const colorTotals = {};
    
    const addToColorTotals = (color, gallons) => {
      if (color && gallons) {
        colorTotals[color] = (colorTotals[color] || 0) + gallons;
      }
    };

    if (tennis) addToColorTotals(tennis.color, tennis.gallonsNeeded);
    if (pickleball) {
      addToColorTotals(pickleball.kitchen.color, pickleball.kitchen.gallonsNeeded);
      addToColorTotals(pickleball.court.color, pickleball.court.gallonsNeeded);
    }
    if (apron) addToColorTotals(apron.color, apron.gallonsNeeded);

    return {
      resurfacer,
      tennis,
      pickleball,
      apron,
      colorTotals
    };
  }, [projectData, pricing]);
};