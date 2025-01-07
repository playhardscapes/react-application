// src/components/estimator/sections/PricingSettings/index.jsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';

const PricingSettings = ({ pricing, onUpdate, onCancel }) => {
  const [localPricing, setLocalPricing] = useState(pricing);

  const updatePrice = (category, subcategory, value) => {
    setLocalPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: value
      }
    }));
  };

  const handleSave = () => {
    onUpdate(localPricing);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pricing Settings</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Materials Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="Binder (5 gal bucket)"
            value={localPricing.materials.cpb}
            onChange={(value) => updatePrice('materials', 'cpb', value)}
            prefix="$"
          />
          <NumberInput
            label="Sand (per bag)"
            value={localPricing.materials.sand}
            onChange={(value) => updatePrice('materials', 'sand', value)}
            prefix="$"
          />
          <NumberInput
            label="Cement (48qt package)"
            value={localPricing.materials.cement}
            onChange={(value) => updatePrice('materials', 'cement', value)}
            prefix="$"
          />
          <NumberInput
            label="Minor Crack Filler (per gal)"
            value={localPricing.materials.minorCracks}
            onChange={(value) => updatePrice('materials', 'minorCracks', value)}
            prefix="$"
          />
          <NumberInput
            label="Major Crack Filler (per gal)"
            value={localPricing.materials.majorCracks}
            onChange={(value) => updatePrice('materials', 'majorCracks', value)}
            prefix="$"
          />
          <NumberInput
            label="Acrylic Resurfacer (per gal)"
            value={localPricing.materials.acrylicResurfacer}
            onChange={(value) => updatePrice('materials', 'acrylicResurfacer', value)}
            prefix="$"
          />
          <NumberInput
            label="Color Coating (per gal)"
            value={localPricing.materials.colorCoating}
            onChange={(value) => updatePrice('materials', 'colorCoating', value)}
            prefix="$"
          />
        </div>
      </Card>

      {/* Equipment Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Equipment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="Tennis Posts (per set)"
            value={localPricing.equipment.permanentTennisPoles}
            onChange={(value) => updatePrice('equipment', 'permanentTennisPoles', value)}
            prefix="$"
          />
          <NumberInput
            label="Pickleball Posts (per set)"
            value={localPricing.equipment.permanentPickleballPoles}
            onChange={(value) => updatePrice('equipment', 'permanentPickleballPoles', value)}
            prefix="$"
          />
          <NumberInput
            label="Mobile Pickleball Nets"
            value={localPricing.equipment.mobilePickleballNets}
            onChange={(value) => updatePrice('equipment', 'mobilePickleballNets', value)}
            prefix="$"
          />
          <NumberInput
            label="Low Grade Windscreen (per ft)"
            value={localPricing.equipment.lowGradeWindscreen}
            onChange={(value) => updatePrice('equipment', 'lowGradeWindscreen', value)}
            prefix="$"
          />
          <NumberInput
            label="High Grade Windscreen (per ft)"
            value={localPricing.equipment.highGradeWindscreen}
            onChange={(value) => updatePrice('equipment', 'highGradeWindscreen', value)}
            prefix="$"
          />
        </div>
      </Card>

      {/* Services Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NumberInput
            label="Acid Wash (per sq ft)"
            value={localPricing.services.acidWash}
            onChange={(value) => updatePrice('services', 'acidWash', value)}
            prefix="$"
          />
          <NumberInput
            label="Hole Cutting (per hole)"
            value={localPricing.services.holeCutting}
            onChange={(value) => updatePrice('services', 'holeCutting', value)}
            prefix="$"
          />
          <NumberInput
            label="General Labor (per hour)"
            value={localPricing.services.generalLabor}
            onChange={(value) => updatePrice('services', 'generalLabor', value)}
            prefix="$"
          />
          <NumberInput
            label="Windscreen Installation (per ft)"
            value={localPricing.services.windscreenInstallation}
            onChange={(value) => updatePrice('services', 'windscreenInstallation', value)}
            prefix="$"
          />
        </div>
      </Card>
    </div>
  );
};

export default PricingSettings;