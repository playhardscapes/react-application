// ColorCoatingSystem.jsx
import React from 'react';
import { formatCurrency } from '../../utils';
import { COLORS } from '../../constants/colors';

export const ColorCoatingSystem = ({ projectData, globalPricing, onCostChange }) => {
  // Add console logs here
  console.log('Project Data:', projectData);
  console.log('Court Config:', projectData.courtConfig);
  console.log('Full Project Data:', JSON.stringify(projectData, null, 2));

  const prices = globalPricing?.materials || {};
  const colorPrice = prices.colorCoating || 0;
  const drumPrice = colorPrice * 30;
  const courts = projectData.courtConfig?.sports || {};

  const calculateAreaAndGallons = (area) => {
    const gallonsNeeded = Math.ceil((area / 125) * 1.5 * 2);
    const drums = Math.max(1, Math.ceil(gallonsNeeded / 30));
    return { gallonsNeeded, drums };
  };

const calculateCourtAreas = () => {
    // Use substrate dimensions instead of root dimensions
    const totalWidth = parseInt(projectData.substrate.dimensions?.width) || 0;
    const totalLength = parseInt(projectData.substrate.dimensions?.length) || 0;
    const totalArea = totalWidth * totalLength;

    console.log('Area Calculations:', {
      width: totalWidth,
      length: totalLength,
      totalArea,
    });

    let usedArea = 0;
    const areas = {};

    // Calculate Tennis Courts
    if (courts.tennis?.selected) {
      const count = courts.tennis.courtCount || 0;
      const courtArea = 78 * 36 * count;
      usedArea += courtArea;

      const { gallonsNeeded, drums } = calculateAreaAndGallons(courtArea);
      areas.tennis = {
        courtCount: count,
        color: courts.tennis.colors?.court,
        area: courtArea,
        gallonsNeeded,
        drums
      };
    }

    // Calculate Pickleball Courts
    if (courts.pickleball?.selected) {
      const count = courts.pickleball.courtCount || 0;
      const kitchenArea = 14 * 20 * count;
      const courtArea = (44 * 20 * count) - kitchenArea;
      usedArea += (courtArea + kitchenArea);

      const kitchenCalc = calculateAreaAndGallons(kitchenArea);
      const courtCalc = calculateAreaAndGallons(courtArea);

      areas.pickleball = {
        courtCount: count,
        kitchen: {
          color: courts.pickleball.colors?.kitchen,
          area: kitchenArea,
          gallonsNeeded: kitchenCalc.gallonsNeeded,
          drums: kitchenCalc.drums
        },
        court: {
          color: courts.pickleball.colors?.court,
          area: courtArea,
          gallonsNeeded: courtCalc.gallonsNeeded,
          drums: courtCalc.drums
        }
      };
    }

    // Calculate Basketball Court
    if (courts.basketball?.selected) {
      const isFullCourt = courts.basketball.courtType === 'full';
      const courtArea = isFullCourt ? 100 * 100 : 50 * 50;
      usedArea += courtArea;

      const { gallonsNeeded, drums } = calculateAreaAndGallons(courtArea);
      areas.basketball = {
        courtType: isFullCourt ? 'Full Court' : 'Half Court',
        color: courts.basketball.colors?.court,
        area: courtArea,
        gallonsNeeded,
        drums
      };
    }

      // Calculate Apron/Boundary
    const apronArea = Math.max(0, totalArea - usedArea);
    console.log('Apron Calculation:', {
      totalArea,
      usedArea,
      apronArea,
      apronColor: projectData.courtConfig.apron.color
    });

    if (apronArea > 0) {
      const { gallonsNeeded, drums } = calculateAreaAndGallons(apronArea);
      areas.apron = {
        name: "Apron/Boundary",
        color: projectData.courtConfig.apron.color,
        area: apronArea,
        gallonsNeeded,
        drums
      };
    }

    return areas;
  };

  const courtAreas = calculateCourtAreas();
  console.log('Court Areas:', courtAreas); // Add this line

  // Calculate color totals
  const colorTotals = {};
  Object.entries(courtAreas).forEach(([areaType, data]) => {
    if (areaType === 'pickleball') {
      // Handle pickleball's multiple colors
      ['kitchen', 'court'].forEach(part => {
        if (!data[part]) return;
        const color = data[part].color;
        if (!colorTotals[color]) {
          colorTotals[color] = { gallonsNeeded: 0, drums: 0, cost: 0 };
        }
        colorTotals[color].gallonsNeeded += data[part].gallonsNeeded;
        colorTotals[color].drums += data[part].drums;
        colorTotals[color].cost += data[part].drums * drumPrice;
      });
    } else {
      // Handle other court types and apron
      const color = data.color;
      if (!color) return;
      if (!colorTotals[color]) {
        colorTotals[color] = { gallonsNeeded: 0, drums: 0, cost: 0 };
      }
      colorTotals[color].gallonsNeeded += data.gallonsNeeded;
      colorTotals[color].drums += data.drums;
      colorTotals[color].cost += data.drums * drumPrice;
    }
  });

  const totalCost = Object.values(colorTotals).reduce((sum, color) => sum + color.cost, 0);

  // Notify parent of cost change
  React.useEffect(() => {
    if (onCostChange) {
      onCostChange(totalCost);
    }
  }, [totalCost, onCostChange]);

  return (
    <div className="border-t border-gray-200 py-4">
      <h4 className="font-medium mb-2">Color Coating System</h4>

      {/* Tennis Courts */}
      {courtAreas.tennis && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-600 mb-2">
            Tennis Courts ({courtAreas.tennis.courtCount} courts)
          </h5>
          <div className="flex justify-between text-sm">
            <span>Court ({COLORS[courtAreas.tennis.color]}):</span>
            <span>{courtAreas.tennis.gallonsNeeded} gallons needed</span>
          </div>
        </div>
      )}

      {/* Pickleball Courts */}
      {courtAreas.pickleball && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-600 mb-2">
            Pickleball Courts ({courtAreas.pickleball.courtCount} courts)
          </h5>
          <div className="flex justify-between text-sm">
            <span>Kitchen ({COLORS[courtAreas.pickleball.kitchen.color]}):</span>
            <span>{courtAreas.pickleball.kitchen.gallonsNeeded} gallons needed</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Court ({COLORS[courtAreas.pickleball.court.color]}):</span>
            <span>{courtAreas.pickleball.court.gallonsNeeded} gallons needed</span>
          </div>
        </div>
      )}

      {/* Basketball Court */}
      {courtAreas.basketball && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-600 mb-2">
            Basketball ({courtAreas.basketball.courtType})
          </h5>
          <div className="flex justify-between text-sm">
            <span>Court ({COLORS[courtAreas.basketball.color]}):</span>
            <span>{courtAreas.basketball.gallonsNeeded} gallons needed</span>
          </div>
        </div>
      )}

      {/* Apron/Boundary Section */}
      {courtAreas.apron && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-600 mb-2">{courtAreas.apron.name}</h5>
          <div className="flex justify-between text-sm">
            <span>Area ({COLORS[courtAreas.apron.color]}):</span>
            <span>{courtAreas.apron.gallonsNeeded} gallons needed</span>
          </div>
        </div>
      )}

      {/* Color Summary for Ordering */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <h5 className="text-sm font-medium mb-2">Color Summary for Ordering</h5>
        {Object.entries(colorTotals).map(([color, data]) => (
          <div key={color} className="mb-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{COLORS[color]}:</span>
              <span>{data.drums} x 30-gallon drums @ {formatCurrency(drumPrice)}/drum</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Cost:</span>
              <span>{formatCurrency(data.cost)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Cost */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between font-medium">
          <span>Total Color Coating Cost:</span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
      </div>
    </div>
  );
};

export default ColorCoatingSystem;
