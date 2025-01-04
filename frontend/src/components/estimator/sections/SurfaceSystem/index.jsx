 // src/components/estimator/sections/SurfaceSystem/index.jsx
import React from 'react';
import { SurfacePrep } from './SurfacePrep';
import { PatchWork } from './PatchWork';
import { FiberglassMesh } from './FiberglassMesh';
import { CushionSystem } from './CushionSystem';

const SurfaceSystem = ({ data, dimensions, onChange }) => {
  const updateField = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Surface System</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SurfacePrep data={data} onChange={updateField} />
          <PatchWork
            data={data.patchWork}
            onChange={(value) => updateField('patchWork', value)}
          />
        </div>

        <div className="space-y-4">
          <FiberglassMesh
            data={data.fiberglassMesh}
            squareFootage={dimensions?.squareFootage}
            onChange={(value) => updateField('fiberglassMesh', value)}
          />
          <CushionSystem
            data={data.cushionSystem}
            squareFootage={dimensions?.squareFootage}
            onChange={(value) => updateField('cushionSystem', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SurfaceSystem;

