import React from 'react';
import { Card } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import { formatCurrency } from '@/utils/formatting';
import { usePricing } from '@/hooks/usePricing';

const SurfacePrep = ({ data, onChange }) => {
  const { getPriceByName } = usePricing();

  const calculateCost = (type) => {
    if (!data.square_footage) return 0;
    
    switch(type) {
      case 'pressure':
        return data.square_footage * getPriceByName('Pressure Washing');
      case 'acid':
        return data.square_footage * getPriceByName('Acid Wash (Concrete Only)');
      case 'patch':
        return (data.patch_work_gallons || 0) * getPriceByName('Court Patch Binder - Materials');
      case 'minor_crack':
        return (data.minor_crack_gallons || 0) * getPriceByName('Minor Crack Repair (Filling and Sealing)');
      case 'major_crack':
        return (data.major_crack_gallons || 0) * getPriceByName('Major Crack Repair (Filling and Sealing)');
      case 'fiberglass_install':
        return (data.fiberglass_mesh_area || 0) * (
          getPriceByName('Fiberglass Mesh System Installation') || 0
        );
      case 'fiberglass_material':
        return (data.fiberglass_mesh_area || 0) * getPriceByName('Fiberglass Mesh System Materials');
      case 'cushion_install':
        return (data.cushion_system_area || 0) * getPriceByName('Cushion System Installation');
      case 'cushion_material':
        return (data.cushion_system_area || 0) * getPriceByName('Cushion System Materials');
      default:
        return 0;
    }
  };

  const pressureWashCost = data.needs_pressure_wash ? calculateCost('pressure') : 0;
  const acidWashCost = data.needs_acid_wash ? calculateCost('acid') : 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Surface Preparation</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.needs_pressure_wash || false}
                    onChange={(e) => onChange({
                      ...data,
                      needs_pressure_wash: e.target.checked
                    })}
                    className="h-4 w-4"
                  />
                  <span>Pressure Wash</span>
                </label>
                {data.needs_pressure_wash && (
                  <span className="text-sm font-medium">
                    {formatCurrency(pressureWashCost)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.needs_acid_wash || false}
                    onChange={(e) => onChange({
                      ...data,
                      needs_acid_wash: e.target.checked
                    })}
                    className="h-4 w-4"
                  />
                  <span>Acid Wash (New Concrete Only)</span>
                </label>
                {data.needs_acid_wash && (
                  <span className="text-sm font-medium">
                    {formatCurrency(acidWashCost)}
                  </span>
                )}
              </div>

              {(data.needs_pressure_wash || data.needs_acid_wash) && (
                <div className="bg-blue-50 p-3 rounded space-y-2">
                  <p className="text-sm text-blue-800">
                    Area: {data.square_footage?.toLocaleString() || 0} sq ft
                  </p>
                  {data.needs_pressure_wash && (
                    <p className="text-sm text-blue-600">
                      Pressure Wash: {formatCurrency(pressureWashCost)}
                    </p>
                  )}
                  {data.needs_acid_wash && (
                    <p className="text-sm text-blue-600">
                      Acid Wash: {formatCurrency(acidWashCost)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
  <h4 className="font-medium">Patch Work</h4>
  <div className="space-y-4 border rounded p-4">
    <div className="space-y-3">
      <NumberInput
        label="Patch Work (gallons)"
        value={data.patch_work_gallons || 0}
        onChange={(value) => onChange({
          ...data,
          patch_work_gallons: value
        })}
        min={0}
      />
      <NumberInput
        label="Minor Cracks (gallons)"
        value={data.minor_crack_gallons || 0}
        onChange={(value) => onChange({
          ...data,
          minor_crack_gallons: value
        })}
        min={0}
      />
      <NumberInput
        label="Major Cracks (gallons)"
        value={data.major_crack_gallons || 0}
        onChange={(value) => onChange({
          ...data,
          major_crack_gallons: value
        })}
        min={0}
      />
    </div>
    <div className="text-sm text-gray-600 space-y-1">
      <p>Total: {formatCurrency(
        calculateCost('patch') +
        calculateCost('minor_crack') +
        calculateCost('major_crack')
      )}</p>
    </div>
  </div>
</div>
          </div>

          <div className="space-y-4">
            <div className="border rounded p-4">
              <h4 className="font-medium mb-3">Additional Systems</h4>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.fiberglass_mesh_needed || false}
                    onChange={(e) => onChange({
                      ...data,
                      fiberglass_mesh_needed: e.target.checked,
                      fiberglass_mesh_area: e.target.checked ? 0 : null
                    })}
                    className="h-4 w-4"
                  />
                  <span>Fiberglass Mesh System</span>
                </label>

                {data.fiberglass_mesh_needed && (
                  <NumberInput
                    label="Mesh Area (sq ft)"
                    value={data.fiberglass_mesh_area || 0}
                    onChange={(value) => onChange({
                      ...data,
                      fiberglass_mesh_area: value
                    })}
                    min={0}
                    max={data.square_footage}
                    helperText={`Maximum area: ${data.square_footage} sq ft`}
                  />
                )}
                {data.fiberglass_mesh_needed && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Installation: {formatCurrency(calculateCost('fiberglass_install'))}</p>
                    <p>Materials: {formatCurrency(calculateCost('fiberglass_material'))}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-4 pt-4 border-t">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.cushion_system_needed || false}
                    onChange={(e) => onChange({
                      ...data,
                      cushion_system_needed: e.target.checked,
                      cushion_system_area: e.target.checked ? 0 : null
                    })}
                    className="h-4 w-4"
                  />
                  <span>Cushion System</span>
                </label>

                {data.cushion_system_needed && (
                  <NumberInput
                    label="System Area (sq ft)"
                    value={data.cushion_system_area || 0}
                    onChange={(value) => onChange({
                      ...data,
                      cushion_system_area: value
                    })}
                    min={0}
                    max={data.square_footage}
                    helperText={`Maximum area: ${data.square_footage} sq ft`}
                  />
                )}
                {data.cushion_system_needed && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Installation: {formatCurrency(calculateCost('cushion_install'))}</p>
                    <p>Materials: {formatCurrency(calculateCost('cushion_material'))}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SurfacePrep;