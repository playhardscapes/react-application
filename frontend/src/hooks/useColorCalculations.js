// src/hooks/useColorCalculations.js
import { useMemo } from 'react';

const COVERAGE_RATE = 125; // sq ft per gallon
const WASTE_FACTOR = 1.5;
const COATS = 2;

// Standard court dimensions
const COURT_DIMENSIONS = {
  tennis: {
    width: 36,
    length: 78
  },
  pickleball: {
    court: {
      width: 20,
      length: 30
    },
    kitchen: {
      width: 20,
      length: 14
    }
  },
  basketball: {
    half: {
      width: 50,
      length: 50
    },
    full: {
      width: 50,
      length: 100
    }
  }
};

export const useColorCalculations = (projectData, pricing) => {
  return useMemo(() => {
    const { courtConfig, dimensions } = projectData;
    const colorTotals = {};

    // Total project area
    const totalArea = dimensions.length * dimensions.width;
    console.log('Total project area:', totalArea);

    const calculateGallons = (sqFt) => Math.ceil((sqFt / COVERAGE_RATE) * WASTE_FACTOR * COATS);

    // Calculate total court areas and colors
    let totalCourtArea = 0;

    // Tennis Court Calculations
    const tennis = courtConfig.sports?.tennis?.selected ? {
      area: COURT_DIMENSIONS.tennis.length * COURT_DIMENSIONS.tennis.width * 
            (courtConfig.sports.tennis.courtCount || 1),
      gallonsNeeded: calculateGallons(
        COURT_DIMENSIONS.tennis.length * COURT_DIMENSIONS.tennis.width * 
        (courtConfig.sports.tennis.courtCount || 1)
      ),
      color: courtConfig.sports.tennis.colors?.court
    } : null;

    if (tennis) totalCourtArea += tennis.area;

    // Pickleball Court Calculations
    const pickleball = courtConfig.sports?.pickleball?.selected ? {
      kitchen: {
        area: COURT_DIMENSIONS.pickleball.kitchen.length * 
              COURT_DIMENSIONS.pickleball.kitchen.width *
              (courtConfig.sports.pickleball.courtCount || 1),
        gallonsNeeded: calculateGallons(
          COURT_DIMENSIONS.pickleball.kitchen.length * 
          COURT_DIMENSIONS.pickleball.kitchen.width *
          (courtConfig.sports.pickleball.courtCount || 1)
        ),
        color: courtConfig.sports.pickleball.colors?.kitchen
      },
      court: {
        area: COURT_DIMENSIONS.pickleball.court.length * 
              COURT_DIMENSIONS.pickleball.court.width *
              (courtConfig.sports.pickleball.courtCount || 1),
        gallonsNeeded: calculateGallons(
          COURT_DIMENSIONS.pickleball.court.length * 
          COURT_DIMENSIONS.pickleball.court.width *
          (courtConfig.sports.pickleball.courtCount || 1)
        ),
        color: courtConfig.sports.pickleball.colors?.court
      }
    } : null;

    if (pickleball) {
      totalCourtArea += pickleball.kitchen.area + pickleball.court.area;
    }

    // Basketball Court Calculations
    const basketball = courtConfig.sports?.basketball?.selected ? {
      area: COURT_DIMENSIONS.basketball[
        courtConfig.sports.basketball.courtType || 'half'
      ].length * COURT_DIMENSIONS.basketball[
        courtConfig.sports.basketball.courtType || 'half'
      ].width,
      gallonsNeeded: calculateGallons(
        COURT_DIMENSIONS.basketball[
          courtConfig.sports.basketball.courtType || 'half'
        ].length * COURT_DIMENSIONS.basketball[
          courtConfig.sports.basketball.courtType || 'half'
        ].width
      ),
      color: courtConfig.sports.basketball.colors?.court
    } : null;

    if (basketball) totalCourtArea += basketball.area;

    // Calculate resurfacer for total area
    const resurfacer = {
      gallonsNeeded: calculateGallons(totalArea),
      drumsRequired: Math.ceil(calculateGallons(totalArea) / 30),
      cost: Math.ceil(calculateGallons(totalArea) / 30) * 
            ((pricing.materials?.acrylicResurfacer || 0) * 30)
    };

    // Apron (remaining area)
    const apronArea = totalArea - totalCourtArea;
    const apron = courtConfig.apron?.color ? {
      area: apronArea,
      gallonsNeeded: calculateGallons(apronArea),
      color: courtConfig.apron.color
    } : null;

    // Debug logs
    console.log({
      totalArea,
      totalCourtArea,
      apronArea,
      tennisArea: tennis?.area,
      pickleballArea: pickleball ? pickleball.kitchen.area + pickleball.court.area : 0,
      basketballArea: basketball?.area
    });

    // Calculate totals by color
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
    if (basketball) addToColorTotals(basketball.color, basketball.gallonsNeeded);
    if (apron) addToColorTotals(apron.color, apron.gallonsNeeded);

    return {
      resurfacer,
      tennis,
      pickleball,
      basketball,
      apron,
      colorTotals
    };
  }, [projectData, pricing]);
};