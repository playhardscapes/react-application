 
// src/components/estimator/sections/EquipmentSection/index.jsx
import React from 'react';
import TennisEquipment from './TennisEquipment';
import PickleballEquipment from './PickleballEquipment';
import BasketballSystems from './BasketballSystems';
import Windscreen from './Windscreen';
import InstallationSummary from './InstallationSummary';

const EquipmentSection = ({ data, onChange }) => {
  const updateField = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Equipment</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TennisEquipment
          data={data}
          onChange={updateField}
        />
        <PickleballEquipment
          data={data}
          onChange={updateField}
        />
      </div>

      <BasketballSystems
        systems={data.basketballSystems || []}
        onChange={(value) => updateField('basketballSystems', value)}
      />

      <Windscreen
        data={data}
        onChange={updateField}
      />

      <InstallationSummary data={data} />
    </div>
  );
};

// TennisEquipment.jsx
const TennisEquipment = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Tennis Equipment</h4>
    <NumberInput
      label="Permanent Tennis Net Posts (sets)"
      value={data.permanentTennisPoles}
      onChange={(value) => onChange('permanentTennisPoles', value)}
      min={0}
      helperText="One set includes two posts and requires 2 holes"
    />
  </div>
);

// PickleballEquipment.jsx
const PickleballEquipment = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Pickleball Equipment</h4>
    <NumberInput
      label="Permanent Pickleball Posts (sets)"
      value={data.permanentPickleballPoles}
      onChange={(value) => onChange('permanentPickleballPoles', value)}
      min={0}
      helperText="One set includes two posts and requires 2 holes"
    />
    <NumberInput
      label="Mobile Pickleball Nets"
      value={data.mobilePickleballNets}
      onChange={(value) => onChange('mobilePickleballNets', value)}
      min={0}
    />
  </div>
);

// BasketballSystems.jsx
const BasketballSystems = ({ systems, onChange }) => {
  const addSystem = () => {
    onChange([
      ...systems,
      {
        type: 'adjustable',
        extension: 4,
        mounted: 'ground'
      }
    ]);
  };

  const updateSystem = (index, field, value) => {
    const updatedSystems = [...systems];
    updatedSystems[index] = {
      ...updatedSystems[index],
      [field]: value
    };
    onChange(updatedSystems);
  };

  const removeSystem = (index) => {
    onChange(systems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Basketball Systems</h4>
        <button
          onClick={addSystem}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add System
        </button>
      </div>

      {systems.map((system, index) => (
        <div key={index} className="border p-4 rounded space-y-3">
          <div className="flex justify-between">
            <h5 className="font-medium">System {index + 1}</h5>
            <button
              onClick={() => removeSystem(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={system.type}
                onChange={(e) => updateSystem(index, 'type', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="adjustable">Adjustable Height</option>
                <option value="fixed">Fixed Height</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mounting</label>
              <select
                value={system.mounted}
                onChange={(e) => updateSystem(index, 'mounted', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="ground">Ground Mount</option>
                <option value="wall">Wall Mount</option>
              </select>
            </div>

            <NumberInput
              label="Extension Length (ft)"
              value={system.extension}
              onChange={(value) => updateSystem(index, 'extension', value)}
              min={4}
              max={8}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Windscreen.jsx
const Windscreen = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="font-medium">Windscreen</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NumberInput
        label="Low-Grade Windscreen (linear feet)"
        value={data.lowGradeWindscreen}
        onChange={(value) => onChange('lowGradeWindscreen', value)}
        min={0}
      />
      <NumberInput
        label="High-Grade Windscreen (linear feet)"
        value={data.highGradeWindscreen}
        onChange={(value) => onChange('highGradeWindscreen', value)}
        min={0}
      />
    </div>
  </div>
);

// InstallationSummary.jsx
const InstallationSummary = ({ data }) => {
  const calculateTotalHoles = () => {
    const tennisHoles = (data.permanentTennisPoles || 0) * 2;
    const pickleballHoles = (data.permanentPickleballPoles || 0) * 2;
    const basketballHoles = (data.basketballSystems || [])
      .filter(system => system.mounted === 'ground')
      .length;

    return tennisHoles + pickleballHoles + basketballHoles;
  };

  return (
    <div className="bg-gray-50 p-4 rounded">
      <h4 className="font-medium mb-2">Installation Requirements</h4>
      <div className="space-y-2">
        <p className="text-sm">
          Total Holes Required: {calculateTotalHoles()}
          <span className="text-gray-500 ml-2">
            ({data.permanentTennisPoles * 2 || 0} tennis +
            {data.permanentPickleballPoles * 2 || 0} pickleball +
            {(data.basketballSystems || []).filter(s => s.mounted === 'ground').length} basketball)
          </span>
        </p>
      </div>
    </div>
  );
};

export default EquipmentSection;
