// src/components/estimator/sections/SurfaceSystem/index.jsx
import React from 'react';
import { NumberInput } from '@/components/ui/number-input';
import SurfacePrep from './SurfacePrep';
import PatchWork from './PatchWork';
import FiberglassSystem from './FiberglassSystem';
import CushionSystem from './CushionSystem';

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
          <PatchWork data={data.patchWork} onChange={(value) => updateField('patchWork', value)} />
        </div>

        <div className="space-y-4">
          <FiberglassSystem
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

// SurfacePrep.jsx
const SurfacePrep = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Surface Preparation</h4>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needsAcidWash}
        onChange={(e) => onChange('needsAcidWash', e.target.checked)}
        className="h-4 w-4"
      />
      <span>Acid Wash (New Concrete Only)</span>
    </label>

    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needsPressureWash}
        onChange={(e) => onChange('needsPressureWash', e.target.checked)}
        className="h-4 w-4"
      />
      <span>Pressure Wash</span>
    </label>
  </div>
);

// PatchWork.jsx
const PatchWork = ({ data, onChange }) => (
  <div className="space-y-3">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needed}
        onChange={(e) => onChange({ ...data, needed: e.target.checked })}
        className="h-4 w-4"
      />
      <span>Patch Work Required</span>
    </label>

    {data.needed && (
      <div className="pl-6 space-y-3">
        <NumberInput
          label="Estimated Patch Work (gallons)"
          value={data.estimatedGallons}
          onChange={(value) => onChange({ ...data, estimatedGallons: value })}
          min={0}
        />

        <NumberInput
          label="Minor Cracks (gallons)"
          value={data.minorCrackGallons}
          onChange={(value) => onChange({ ...data, minorCrackGallons: value })}
          min={0}
        />

        <NumberInput
          label="Major Cracks (gallons)"
          value={data.majorCrackGallons}
          onChange={(value) => onChange({ ...data, majorCrackGallons: value })}
          min={0}
        />
      </div>
    )}
  </div>
);

// FiberglassSystem.jsx
const FiberglassSystem = ({ data, squareFootage, onChange }) => (
  <div className="space-y-3">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needed}
        onChange={(e) => onChange({ ...data, needed: e.target.checked })}
        className="h-4 w-4"
      />
      <span>Fiberglass Mesh System</span>
    </label>

    {data.needed && (
      <div className="pl-6">
        <NumberInput
          label="Mesh Area (sq ft)"
          value={data.area}
          onChange={(value) => onChange({ ...data, area: value })}
          min={0}
          max={squareFootage}
          helperText={`Maximum area: ${squareFootage} sq ft`}
        />
      </div>
    )}
  </div>
);

// CushionSystem.jsx
const CushionSystem = ({ data, squareFootage, onChange }) => (
  <div className="space-y-3">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={data.needed}
        onChange={(e) => onChange({ ...data, needed: e.target.checked })}
        className="h-4 w-4"
      />
      <span>Cushion System</span>
    </label>

    {data.needed && (
      <div className="pl-6">
        <NumberInput
          label="Cushion Area (sq ft)"
          value={data.area}
          onChange={(value) => onChange({ ...data, area: value })}
          min={0}
          max={squareFootage}
          helperText={`Maximum area: ${squareFootage} sq ft`}
        />
      </div>
    )}
  </div>
);

export default SurfaceSystem;
