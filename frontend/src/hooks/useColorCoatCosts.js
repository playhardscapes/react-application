// src/hooks/useColorCoatCosts.js
import { useMemo } from 'react';
import { usePricing } from './usePricing';
import { COLORS } from '../components/estimates/form/tabs/CourtDesign/constants';

const COURT_DIMENSIONS = {
  tennis: { width: 36, length: 78 },      // Standard court plus overrun
  pickleballKitchen: { width: 14, length: 20 },
  pickleballCourt: { width: 30, length: 60 },
  basketballHalf: { width: 50, length: 50 },
  basketballFull: { width: 50, length: 94 }
};

const SQFT_PER_GALLON = 100;
const WASTE_FACTOR = 1.15;
const COATS = 2;
const GALLONS_PER_DRUM = 30;
const FREIGHT_PER_DRUM = 100;

export const useColorCoatCosts = (data) => {
  const { getPriceById } = usePricing();

  return useMemo(() => {
    const calculateGallonsForArea = (squareFeet) => {
      const baseGallons = squareFeet / SQFT_PER_GALLON;
      const gallonsWithWaste = baseGallons * WASTE_FACTOR * COATS;
      return Math.ceil(gallonsWithWaste / GALLONS_PER_DRUM) * GALLONS_PER_DRUM;
    };
    
    const calculateResurfacerCosts = () => {
      if (!data.square_footage) return null;
      
      const resurfacerRate = getPriceById(20); // Acrylic Resurfacer - Material
      const installationRate = getPriceById(50); // Acrylic Resurfacer - (2) Coats
      const gallonsNeeded = calculateGallonsForArea(data.square_footage);
      const drumsNeeded = Math.ceil(gallonsNeeded / GALLONS_PER_DRUM);
      
      return {
        cost: (drumsNeeded * resurfacerRate) + (drumsNeeded * FREIGHT_PER_DRUM),
        installationCost: data.square_footage * installationRate,
        gallons: gallonsNeeded,
        drums: drumsNeeded
      };
    };
 
    const calculateBasketballLaneArea = (courtType) => {
      const laneWidth = 16;  // feet
      const laneLength = 19; // feet
      
      return courtType === 'half' ? (laneWidth * laneLength) : (laneWidth * laneLength * 2);
    };

    const calculateAreasByColor = () => {
      const colorAreas = new Map();
      let totalColoredArea = 0;

      // Tennis Courts
      if (data.tennis_courts > 0) {
        const tennisArea = COURT_DIMENSIONS.tennis.width * 
                          COURT_DIMENSIONS.tennis.length * 
                          data.tennis_courts;
        totalColoredArea += tennisArea;
        
        const tennisColor = data.tennis_court_color;
        colorAreas.set(tennisColor, (colorAreas.get(tennisColor) || 0) + tennisArea);
      }

      // Pickleball Courts
      if (data.pickleball_courts > 0) {
        // Kitchen area
        const kitchenArea = COURT_DIMENSIONS.pickleballKitchen.width * 
                           COURT_DIMENSIONS.pickleballKitchen.length * 
                           data.pickleball_courts;
        totalColoredArea += kitchenArea;
        
        const kitchenColor = data.pickleball_kitchen_color;
        colorAreas.set(kitchenColor, (colorAreas.get(kitchenColor) || 0) + kitchenArea);

        // Court area
        const courtArea = COURT_DIMENSIONS.pickleballCourt.width * 
                         COURT_DIMENSIONS.pickleballCourt.length * 
                         data.pickleball_courts;
        totalColoredArea += courtArea;
        
        const courtColor = data.pickleball_court_color;
        colorAreas.set(courtColor, (colorAreas.get(courtColor) || 0) + courtArea);
      }

      // Basketball Courts
      if (data.basketball_courts > 0) {
        const dimensions = data.basketball_court_type === 'half' ? 
                          COURT_DIMENSIONS.basketballHalf : 
                          COURT_DIMENSIONS.basketballFull;
        
        const basketballArea = dimensions.width * dimensions.length;
        totalColoredArea += basketballArea;
        
        const courtColor = data.basketball_court_color;
        colorAreas.set(courtColor, (colorAreas.get(courtColor) || 0) + basketballArea);

        if (data.basketball_lane_color) {
          // Add lane area calculation
          const laneArea = calculateBasketballLaneArea(data.basketball_court_type);
          totalColoredArea += laneArea;
          const laneColor = data.basketball_lane_color;
          colorAreas.set(laneColor, (colorAreas.get(laneColor) || 0) + laneArea);
        }
      }

      // Apron Color
      if (data.apron_color) {
        // Estimate apron area as the difference between total square footage and colored areas
        const apronArea = data.square_footage - totalColoredArea;
        const apronColor = data.apron_color;
        
        // Only add if there's a non-zero apron area
        if (apronArea > 0) {
          colorAreas.set(apronColor, (colorAreas.get(apronColor) || 0) + apronArea);
          totalColoredArea += apronArea;
        }
      }

      return {
        colorAreas,
        totalColoredArea,
        remainingArea: data.square_footage - totalColoredArea
      };
    };

    const getColorMaterialId = (colorValue) => {
      const color = COLORS.find(c => c.value === colorValue);
      return color?.materialId || 56; // Default to gray if color not found
    };

    const calculateMaterialCosts = () => {
      const { colorAreas, remainingArea } = calculateAreasByColor();
      const materialCosts = {
        byColor: new Map(),
        total: 0,
        materialBreakdown: [] // Track materials used
      };

      // Calculate costs for each color
      colorAreas.forEach((area, colorValue) => {
        const gallonsNeeded = calculateGallonsForArea(area);
        const drumsNeeded = Math.ceil(gallonsNeeded / GALLONS_PER_DRUM);
        const materialId = getColorMaterialId(colorValue);
        const colorPrice = getPriceById(materialId);
        const cost = (drumsNeeded * colorPrice) + (drumsNeeded * FREIGHT_PER_DRUM);
        
        const colorInfo = COLORS.find(c => c.value === colorValue);
        materialCosts.byColor.set(colorValue, {
          area,
          gallons: gallonsNeeded,
          drums: drumsNeeded,
          cost,
          materialId
        });

        materialCosts.materialBreakdown.push({
          materialId, 
          colorName: colorInfo?.label || 'Unknown', 
          drums: drumsNeeded, 
          area
        });

        materialCosts.total += cost;
      });

      // Calculate remaining area cost
      if (remainingArea > 0) {
        const gallonsNeeded = calculateGallonsForArea(remainingArea);
        const drumsNeeded = Math.ceil(gallonsNeeded / GALLONS_PER_DRUM);
        const basePrice = getPriceById(56); // Gray
        const cost = (drumsNeeded * basePrice) + (drumsNeeded * FREIGHT_PER_DRUM);
        
        materialCosts.remaining = {
          area: remainingArea,
          gallons: gallonsNeeded,
          drums: drumsNeeded,
          cost
        };
        materialCosts.total += cost;
      }

      return materialCosts;
    };

    const calculateInstallationCosts = () => {
      const baseRate = getPriceById(64); // Color Coat Installation - (2) Coats
      const uniqueColors = new Set([
        data.tennis_court_color,
        data.pickleball_kitchen_color,
        data.pickleball_court_color,
        data.basketball_court_color,
        data.basketball_lane_color
      ]).size;

      let upchargeRate = 0;
      if (uniqueColors === 2) upchargeRate = getPriceById(65);      // 2 color upcharge
      else if (uniqueColors === 3) upchargeRate = getPriceById(66); // 3 color upcharge
      else if (uniqueColors === 4) upchargeRate = getPriceById(67); // 4 color upcharge
      else if (uniqueColors >= 5) upchargeRate = getPriceById(68);  // 5 color upcharge

      const baseCost = data.square_footage * baseRate;
      const upchargeCost = data.square_footage * upchargeRate;

      return {
        baseCost,
        upchargeCost,
        total: baseCost + upchargeCost,
        uniqueColors
      };
    };

    const calculateLiningCosts = () => {
      const costs = {
        tennis: data.tennis_courts > 0 ? 
          data.tennis_courts * getPriceById(69) : 0,    // Tennis Court Lining
        pickleball: data.pickleball_courts > 0 ?
          data.pickleball_courts * getPriceById(70) : 0, // Pickleball Lines
          basketball: 0
        };
      
        if (data.basketball_courts > 0) {
          const halfCourtCount = data.basketball_court_type === 'half' ? data.basketball_courts : 0;
          const fullCourtCount = data.basketball_court_type === 'full' ? data.basketball_courts : 0;
          
          // Base court lines
          costs.basketball += halfCourtCount * getPriceById(71); // Half court lines
          costs.basketball += fullCourtCount * getPriceById(72); // Full court lines
          
          // Three point lines
          if (data.basketball_three_point_lines?.includes('high-school')) {
            costs.basketball += halfCourtCount * getPriceById(73);      // High school arc for half courts
            costs.basketball += fullCourtCount * 2 * getPriceById(73);  // High school arc for full courts (x2)
          }
          if (data.basketball_three_point_lines?.includes('college')) {
            costs.basketball += halfCourtCount * getPriceById(75);      // College arc for half courts
            costs.basketball += fullCourtCount * 2 * getPriceById(75);  // College arc for full courts (x2)
          }
          if (data.basketball_three_point_lines?.includes('nba')) {
            costs.basketball += halfCourtCount * getPriceById(74);      // NBA arc for half courts
            costs.basketball += fullCourtCount * 2 * getPriceById(74);  // NBA arc for full courts (x2)
          }
        }
      
        costs.total = costs.tennis + costs.pickleball + costs.basketball;
        return costs;
      };

    const result = {
      materials: {
        ...calculateMaterialCosts(),
        resurfacer: calculateResurfacerCosts()
      },
      installation: calculateInstallationCosts(),
      lining: calculateLiningCosts()
    };

    console.log('Color Coat Calculations:', result);

    return result;
  }, [data, getPriceById]);
};