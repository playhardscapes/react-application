// src/components/estimator/sections/EquipmentSection/index.jsx
import React from 'react';
import { TennisEquipment } from './TennisEquipment';
import { PickleballEquipment } from './PickleballEquipment';
import { BasketballSystems } from './BasketballEquipment';
import { Windscreen } from './WindscreenEquipment';

const EquipmentSection = ({ data = {}, onChange, errors = {} }) => {
  // Handle updates with proper type conversion
  const handleUpdate = (updates) => {
    onChange({
      ...data,
      permanent_tennis_poles: updates.hasOwnProperty('permanentTennisPoles') ?
        Number(updates.permanentTennisPoles) : data.permanent_tennis_poles,
      permanent_pickleball_poles: updates.hasOwnProperty('permanentPickleballPoles') ?
        Number(updates.permanentPickleballPoles) : data.permanent_pickleball_poles,
      mobile_pickleball_nets: updates.hasOwnProperty('mobilePickleballNets') ?
        Number(updates.mobilePickleballNets) : data.mobile_pickleball_nets,
      low_grade_windscreen: updates.hasOwnProperty('lowGradeWindscreen') ?
        Number(updates.lowGradeWindscreen) : data.low_grade_windscreen,
      high_grade_windscreen: updates.hasOwnProperty('highGradeWindscreen') ?
        Number(updates.highGradeWindscreen) : data.high_grade_windscreen,
      basketball_systems: updates.hasOwnProperty('basketballSystems') ?
        updates.basketballSystems : (data.basketball_systems || [])
    });
  };

  // Map database fields to component props
  const equipmentData = {
    permanentTennisPoles: Number(data.permanent_tennis_poles) || 0,
    permanentPickleballPoles: Number(data.permanent_pickleball_poles) || 0,
    mobilePickleballNets: Number(data.mobile_pickleball_nets) || 0,
    lowGradeWindscreen: Number(data.low_grade_windscreen) || 0,
    highGradeWindscreen: Number(data.high_grade_windscreen) || 0,
    basketballSystems: Array.isArray(data.basketball_systems) ? data.basketball_systems : []
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Equipment</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TennisEquipment
          data={equipmentData}
          onChange={(value) => handleUpdate({ permanentTennisPoles: value })}
          error={errors.permanent_tennis_poles}
        />
        <PickleballEquipment
          data={equipmentData}
          onChange={(field, value) => handleUpdate({ [field]: value })}
          errors={{
            permanentPoles: errors.permanent_pickleball_poles,
            mobileNets: errors.mobile_pickleball_nets
          }}
        />
      </div>

      <BasketballSystems
        systems={equipmentData.basketballSystems}
        onChange={(systems) => handleUpdate({ basketballSystems: systems })}
        error={errors.basketball_systems}
      />

      <Windscreen
        data={equipmentData}
        onChange={(field, value) => handleUpdate({ [field]: value })}
        errors={{
          lowGrade: errors.low_grade_windscreen,
          highGrade: errors.high_grade_windscreen
        }}
      />
    </div>
  );
};

export default EquipmentSection;
