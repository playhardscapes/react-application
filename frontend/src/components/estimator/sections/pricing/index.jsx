// pricing/index.jsx
import React, { useState } from 'react';
import { formatCurrency } from './utils';
import { useMaterials } from './hooks/useMaterials';
import { useTravelCosts } from './hooks/useTravelCosts';
import { useEquipmentCosts } from './hooks/useEquipmentCosts';
import { CourtPatchBinder } from './components/MaterialsSection/CourtPatchBinder';
import { CrackFiller } from './components/MaterialsSection/CrackFiller';
import { ResurfacerSystem } from './components/MaterialsSection/ResurfacerSystem';
import { ColorCoatingSystem } from './components/MaterialsSection/ColorCoatingSystem';
import { LinePaintingSystem } from './components/MaterialsSection/LinePaintingSystem';
import { FiberglassSystem } from './components/MaterialsSection/FiberglassSystem';
import { TravelAndLabor } from './components/TravelAndLabor';
import { Equipment } from './components/Equipment';
import { GrandTotal } from './components/GrandTotal';

const PricingSection = ({ projectData, globalPricing }) => {
  const materials = useMaterials(projectData, globalPricing);
  const travelCosts = useTravelCosts(projectData, globalPricing);
  const equipmentCosts = useEquipmentCosts(projectData, globalPricing);
  const [colorCoatingCost, setColorCoatingCost] = useState(0);
  const [linePaintingCost, setLinePaintingCost] = useState(0);

  // Calculate materials total
  const materialTotal =
    (materials?.patchBinder?.cost || 0) +
    (materials?.crackFiller?.minorCost || 0) +
    (materials?.crackFiller?.majorCost || 0) +
    (materials?.resurfacer?.cost || 0) +
    colorCoatingCost +
    (materials?.fiberglassMesh?.cost || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Project Costs Summary</h2>

      {/* Materials Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Materials</h3>

        <CourtPatchBinder
          data={materials.patchBinder}
          globalPricing={globalPricing}
        />

        <CrackFiller
          data={materials.crackFiller}
          globalPricing={globalPricing}
        />

        <ResurfacerSystem
          data={materials.resurfacer}
          globalPricing={globalPricing}
        />

        <ColorCoatingSystem
          projectData={projectData}
          globalPricing={globalPricing}
          onCostChange={setColorCoatingCost}
        />

        <FiberglassSystem
          data={materials.fiberglassMesh}
          globalPricing={globalPricing}
        />

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Materials Cost:</span>
            <span>{formatCurrency(materialTotal)}</span>
          </div>
        </div>
      </div>

      {/* Line Painting Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Line Painting</h3>
        <LinePaintingSystem
          projectData={projectData}
          globalPricing={globalPricing}
          onCostChange={setLinePaintingCost}
        />
      </div>

      {/* Travel and Labor Section */}
      <TravelAndLabor
        projectData={projectData}
        globalPricing={globalPricing}
      />

      {/* Equipment Section */}
      <Equipment
        data={equipmentCosts}
      />

      {/* Grand Total */}
      <GrandTotal
        materialTotal={materialTotal}
        linePaintingTotal={linePaintingCost}
        travelTotal={travelCosts?.total || 0}
        equipmentTotal={equipmentCosts?.total || 0}
      />
    </div>
  );
};

export default PricingSection;
