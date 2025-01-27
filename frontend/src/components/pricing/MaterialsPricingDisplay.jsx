 
// src/components/pricing/MaterialsPricingDisplay.jsx
import React from 'react';
import { useMaterialsCosts } from '../../hooks/useMaterialsCosts';
import { formatCurrency } from '../../utils/formatting';
import { useAuth } from '@/contexts/AuthContext';

const MaterialSection = ({ title, children }) => (
  <div className="border-t border-gray-200 py-3">
    <h4 className="font-medium mb-2">{title}</h4>
    {children}
  </div>
);

const CostRow = ({ label, quantity, unit, cost }) => (
  <div className="flex justify-between text-sm py-1">
    <span className="text-gray-600">
      {label} {quantity && `(${quantity} ${unit})`}
    </span>
    <span>{formatCurrency(cost)}</span>
  </div>
);

const MaterialsPricingDisplay = ({ surfaceData, dimensions, pricing }) => {
  const { token } = useAuth();
  const costs = useMaterialsCosts(surfaceData, dimensions, pricing, token);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Materials Cost Breakdown</h3>

      {/* Patch Work Section */}
      {details.patchWork && (
        <MaterialSection title="Patch Work System">
          <CostRow
            label="Court Patch Binder"
            quantity={details.patchWork.binder.gallons}
            unit="gallons"
            cost={details.patchWork.binder.cost}
          />
          <CostRow
            label="Sand"
            quantity={details.patchWork.sand.bags}
            unit="bags"
            cost={details.patchWork.sand.cost}
          />
          <CostRow
            label="Cement"
            quantity={details.patchWork.cement.quarts}
            unit="quarts"
            cost={details.patchWork.cement.cost}
          />
          {details.patchWork.crackFiller.minor.gallons > 0 && (
            <CostRow
              label="Minor Crack Filler"
              quantity={details.patchWork.crackFiller.minor.gallons}
              unit="gallons"
              cost={details.patchWork.crackFiller.minor.cost}
            />
          )}
          {details.patchWork.crackFiller.major.gallons > 0 && (
            <CostRow
              label="Major Crack Filler"
              quantity={details.patchWork.crackFiller.major.gallons}
              unit="gallons"
              cost={details.patchWork.crackFiller.major.cost}
            />
          )}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <CostRow
              label="Patch Work Subtotal"
              cost={subtotals.patchWork}
            />
          </div>
        </MaterialSection>
      )}

      {/* Resurfacer Section */}
      <MaterialSection title="Resurfacer System">
        <CostRow
          label="Acrylic Resurfacer"
          quantity={details.resurfacer.drumsRequired}
          unit="drums"
          cost={details.resurfacer.cost}
        />
        <div className="text-sm text-gray-500 mt-1">
          {details.resurfacer.gallonsNeeded} gallons total (2 coats)
        </div>
      </MaterialSection>

      {/* Color Coating Section */}
      <MaterialSection title="Color Coating System">
        <CostRow
          label="Color Coating"
          quantity={details.colorCoating.drumsRequired}
          unit="drums"
          cost={details.colorCoating.cost}
        />
        <div className="text-sm text-gray-500 mt-1">
          {details.colorCoating.gallonsNeeded} gallons total (2 coats)
        </div>
      </MaterialSection>

      {/* Fiberglass System */}
      {details.fiberglass && (
        <MaterialSection title="Fiberglass System">
          <CostRow
            label="Fiberglass Mesh"
            quantity={details.fiberglass.mesh.rolls}
            unit="rolls"
            cost={details.fiberglass.mesh.cost}
          />
          <CostRow
            label="Primer"
            quantity={details.fiberglass.primer.gallons}
            unit="gallons"
            cost={details.fiberglass.primer.cost}
          />
          <div className="text-sm text-gray-500 mt-1">
            Covering {details.fiberglass.mesh.area} sq ft
          </div>
        </MaterialSection>
      )}

      {/* Cushion System */}
      {details.cushion && (
        <MaterialSection title="Cushion System">
          <CostRow
            label="Base Coat"
            quantity={details.cushion.baseCoat.gallons}
            unit="gallons"
            cost={details.cushion.baseCoat.cost}
          />
          <CostRow
            label="Finish Coat"
            quantity={details.cushion.finishCoat.gallons}
            unit="gallons"
            cost={details.cushion.finishCoat.cost}
          />
          <div className="text-sm text-gray-500 mt-1">
            Covering {details.cushion.baseCoat.gallons * 100} sq ft
          </div>
        </MaterialSection>
      )}

      {/* Total */}
      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="text-lg font-semibold flex justify-between">
          <span>Total Materials Cost:</span>
          <span>{formatCurrency(costs.total)}</span>
        </div>
      </div>
    </div>
  );
};

export default MaterialsPricingDisplay;
