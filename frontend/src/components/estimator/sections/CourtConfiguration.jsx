// src/components/estimator/sections/CourtConfiguration/index.jsx
import React from 'react';
import TennisCourt from './TennisCourt';
import PickleballCourt from './PickleballCourt';
import BasketballCourt from './BasketballCourt';
import ApronConfig from './ApronConfig';
import { COLORS } from './constants';

const CourtConfiguration = ({ data, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold">Court Configuration</h3>

    <TennisCourt
      data={data.sports?.tennis}
      onChange={(tennisData) => onChange({
        ...data,
        sports: { ...data.sports, tennis: tennisData }
      })}
    />

    <PickleballCourt
      data={data.sports?.pickleball}
      onChange={(pickleballData) => onChange({
        ...data,
        sports: { ...data.sports, pickleball: pickleballData }
      })}
    />

    <BasketballCourt
      data={data.sports?.basketball}
      onChange={(basketballData) => onChange({
        ...data,
        sports: { ...data.sports, basketball: basketballData }
      })}
    />

    <ApronConfig
      data={data.apron}
      onChange={(apronData) => onChange({
        ...data,
        apron: apronData
      })}
    />
  </div>
);

// constants.js
export const COLORS = [
  { value: 'dark-green', label: 'Dark Green' },
  { value: 'light-green', label: 'Light Green' },
  { value: 'dark-blue', label: 'Dark Blue' },
  { value: 'light-blue', label: 'Light Blue' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' }
];

// ColorSelect.jsx
export const ColorSelect = ({ label, value, onChange, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">Select color...</option>
      {COLORS.map(color => (
        <option key={color.value} value={color.value}>
          {color.label}
        </option>
      ))}
    </select>
  </div>
);

// TennisCourt.jsx
const TennisCourt = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <label className="flex items-center space-x-2 mb-3">
      <input
        type="checkbox"
        checked={data.selected || false}
        onChange={(e) => onChange({ ...data, selected: e.target.checked })}
        className="h-4 w-4"
      />
      <span className="font-medium">Tennis</span>
    </label>

    {data.selected && (
      <div className="space-y-3">
        <NumberInput
          label="Number of Courts"
          value={data.courtCount || ''}
          onChange={(value) => onChange({ ...data, courtCount: value })}
          min={1}
        />
        <ColorSelect
          label="Court Color"
          value={data?.colors?.court}
          onChange={(color) => onChange({
            ...data,
            colors: { ...data.colors, court: color }
          })}
        />
      </div>
    )}
  </div>
);

// PickleballCourt.jsx
const PickleballCourt = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <label className="flex items-center space-x-2 mb-3">
      <input
        type="checkbox"
        checked={data.selected || false}
        onChange={(e) => onChange({ ...data, selected: e.target.checked })}
        className="h-4 w-4"
      />
      <span className="font-medium">Pickleball</span>
    </label>

    {data.selected && (
      <div className="space-y-3">
        <NumberInput
          label="Number of Courts"
          value={data.courtCount || ''}
          onChange={(value) => onChange({ ...data, courtCount: value })}
          min={1}
        />
        <div className="grid grid-cols-2 gap-4">
          <ColorSelect
            label="Kitchen Color"
            value={data?.colors?.kitchen}
            onChange={(color) => onChange({
              ...data,
              colors: { ...data.colors, kitchen: color }
            })}
          />
          <ColorSelect
            label="Court Color"
            value={data?.colors?.court}
            onChange={(color) => onChange({
              ...data,
              colors: { ...data.colors, court: color }
            })}
          />
        </div>
      </div>
    )}
  </div>
);

// BasketballCourt.jsx
const BasketballCourt = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <label className="flex items-center space-x-2 mb-3">
      <input
        type="checkbox"
        checked={data.selected || false}
        onChange={(e) => onChange({ ...data, selected: e.target.checked })}
        className="h-4 w-4"
      />
      <span className="font-medium">Basketball</span>
    </label>

    {data.selected && (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Court Type</label>
          <select
            value={data.courtType || ''}
            onChange={(e) => onChange({ ...data, courtType: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select type...</option>
            <option value="half">Half Court</option>
            <option value="full">Full Court</option>
          </select>
        </div>

        <ColorSelect
          label="Court Color"
          value={data?.colors?.court}
          onChange={(color) => onChange({
            ...data,
            colors: { ...data.colors, court: color }
          })}
        />
      </div>
    )}
  </div>
);

// ApronConfig.jsx
const ApronConfig = ({ data = {}, onChange }) => (
  <div className="border p-4 rounded">
    <h4 className="font-medium mb-3">Apron/Boundary Configuration</h4>
    <ColorSelect
      label="Apron Color"
      value={data.color}
      onChange={(color) => onChange({ ...data, color })}
    />
  </div>
);

export default CourtConfiguration;
