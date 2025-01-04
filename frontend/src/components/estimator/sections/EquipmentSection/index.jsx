// src/components/estimator/sections/EquipmentSection/index.jsx
import React from 'react';
import { TennisEquipment } from './TennisEquipment';
import { PickleballEquipment } from './PickleballEquipment';
import { BasketballSystems } from './BasketballEquipment';
import { Windscreen } from './WindscreenEquipment';

const EquipmentSection = ({ data, onChange }) => {
  const updateField = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Equipment</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TennisEquipment data={data} onChange={updateField} />
        <PickleballEquipment data={data} onChange={updateField} />
      </div>

      <BasketballSystems
        systems={data.basketballSystems || []}
        onChange={(systems) => updateField('basketballSystems', systems)}
      />

      <Windscreen
        data={data}
        onChange={updateField}
      />
    </div>
  );
};

export default EquipmentSection;
