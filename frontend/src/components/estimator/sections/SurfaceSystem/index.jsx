// src/components/estimator/sections/SurfaceSystem/index.jsx
import React from 'react';
import { SurfacePrep } from './SurfacePrep';
import { PatchWork } from './PatchWork';
import { FiberglassMesh } from './FiberglassMesh';
import { CushionSystem } from './CushionSystem';

const SurfaceSystem = ({ data = {}, onChange, errors = {} }) => {
  const handleSurfacePrepChange = (field, value) => {
    onChange({
      ...data,
      [`needs_${field}`]: value
    });
  };

  const handlePatchWorkChange = (patchData) => {
    onChange({
      ...data,
      patch_work_needed: patchData.needed,
      patch_work_gallons: Number(patchData.estimatedGallons) || 0,
      minor_crack_gallons: Number(patchData.minorCrackGallons) || 0,
      major_crack_gallons: Number(patchData.majorCrackGallons) || 0
    });
  };

  const handleFiberglassMeshChange = (meshData) => {
    onChange({
      ...data,
      fiberglass_mesh_needed: meshData.needed,
      fiberglass_mesh_area: Number(meshData.area) || 0
    });
  };

  const handleCushionSystemChange = (cushionData) => {
    onChange({
      ...data,
      cushion_system_needed: cushionData.needed,
      cushion_system_area: Number(cushionData.area) || 0
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Surface System</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SurfacePrep
            data={{
              needs_acid_wash: data.needs_acid_wash || false,
              needs_pressure_wash: data.needs_pressure_wash || false
            }}
            onChange={handleSurfacePrepChange}
            errors={errors}
          />

          <PatchWork
            data={{
              needed: data.patch_work_needed || false,
              estimatedGallons: data.patch_work_gallons || 0,
              minorCrackGallons: data.minor_crack_gallons || 0,
              majorCrackGallons: data.major_crack_gallons || 0
            }}
            onChange={handlePatchWorkChange}
            errors={errors}
          />
        </div>

        <div className="space-y-4">
          <FiberglassMesh
            data={{
              needed: data.fiberglass_mesh_needed || false,
              area: data.fiberglass_mesh_area || 0
            }}
            maxArea={data.square_footage || 0}
            onChange={handleFiberglassMeshChange}
            errors={errors}
          />

          <CushionSystem
            data={{
              needed: data.cushion_system_needed || false,
              area: data.cushion_system_area || 0
            }}
            maxArea={data.square_footage || 0}
            onChange={handleCushionSystemChange}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );
};

export default SurfaceSystem;
