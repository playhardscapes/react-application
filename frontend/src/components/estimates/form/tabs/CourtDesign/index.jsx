// src/components/estimator/EstimationForm/tabs/CourtDesign/index.jsx
import React from 'react';
import { Card } from '@/components/ui/card';

export const COLORS = [
    { value: 'dark-blue', label: 'Dark Blue', materialId: 21 },
    { value: 'dark-green', label: 'Dark Green', materialId: 55 },
    { value: 'gray', label: 'Gray', materialId: 56 },
    { value: 'light-blue', label: 'Light Blue', materialId: 57 },
    { value: 'light-green', label: 'Light Green', materialId: 58 },
    { value: 'medium-green', label: 'Medium Green', materialId: 59 },
    { value: 'purple', label: 'Purple', materialId: 60 },
    { value: 'red', label: 'Red', materialId: 61 },
    { value: 'sahara-sand', label: 'Sahara Sand', materialId: 62 }
  ];

const ColorSelect = ({ label, value, onChange, className = '' }) => (
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

const AthleticCourt = ({ type, data, onChange }) => {
  const handleChange = (updates) => {
    onChange({
      ...data,
      ...updates
    });
  };

  return (
    <div className="border p-4 rounded space-y-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={data.selected || false}
          onChange={(e) => handleChange({ selected: e.target.checked })}
          className="h-4 w-4"
        />
        <span className="font-medium">{type}</span>
      </label>

      {data.selected && (
        <div className="space-y-4 pl-6">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Courts</label>
            <input
              type="number"
              value={data.courtCount || 1}
              onChange={(e) => handleChange({ courtCount: parseInt(e.target.value) || 1 })}
              min={1}
              className="w-full p-2 border rounded"
            />
          </div>

          <ColorSelect
            label="Court Color"
            value={data.colors?.court}
            onChange={(color) => handleChange({
              colors: { ...data.colors, court: color }
            })}
          />

          {type === 'pickleball' && (
            <ColorSelect
              label="Kitchen Color"
              value={data.colors?.kitchen}
              onChange={(color) => handleChange({
                colors: { ...data.colors, kitchen: color }
              })}
            />
          )}

          {type === 'basketball' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Court Type</label>
                <select
                  value={data.courtType || ''}
                  onChange={(e) => handleChange({ courtType: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select type...</option>
                  <option value="half">Half Court</option>
                  <option value="full">Full Court</option>
                </select>
              </div>

              <ColorSelect
                label="Lane Color"
                value={data.colors?.lane}
                onChange={(color) => handleChange({
                  colors: { ...data.colors, lane: color }
                })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-1">Three Point Lines</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.threePointLines?.includes('high-school') || false}
                      onChange={(e) => {
                        const current = data.threePointLines || [];
                        const updated = e.target.checked
                          ? [...current, 'high-school']
                          : current.filter(line => line !== 'high-school');
                        handleChange({ threePointLines: updated });
                      }}
                      className="h-4 w-4"
                    />
                    <span>High School</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.threePointLines?.includes('college') || false}
                      onChange={(e) => {
                        const current = data.threePointLines || [];
                        const updated = e.target.checked
                          ? [...current, 'college']
                          : current.filter(line => line !== 'college');
                        handleChange({ threePointLines: updated });
                      }}
                      className="h-4 w-4"
                    />
                    <span>College</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.threePointLines?.includes('nba') || false}
                      onChange={(e) => {
                        const current = data.threePointLines || [];
                        const updated = e.target.checked
                          ? [...current, 'nba']
                          : current.filter(line => line !== 'nba');
                        handleChange({ threePointLines: updated });
                      }}
                      className="h-4 w-4"
                    />
                    <span>NBA</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CourtDesign = ({ data = {}, onChange }) => {
  const handleCourtUpdate = (sport, updates) => {
    const courtCount = updates.selected ? (updates.courtCount || 1) : 0;
    
    onChange({
      ...data,
      [`${sport}_courts`]: courtCount,
      [`${sport}_court_color`]: updates.colors?.court,
      [`${sport}_kitchen_color`]: updates.colors?.kitchen,
      [`${sport}_lane_color`]: updates.colors?.lane,
      [`${sport}_court_type`]: updates.courtType,
      [`${sport}_three_point_lines`]: updates.threePointLines
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Court Configuration</h3>

        <AthleticCourt
          type="tennis"
          data={{
            selected: data.tennis_courts > 0,
            courtCount: data.tennis_courts || 1,
            colors: { court: data.tennis_court_color }
          }}
          onChange={(updates) => handleCourtUpdate('tennis', updates)}
        />

        <AthleticCourt
          type="pickleball"
          data={{
            selected: data.pickleball_courts > 0,
            courtCount: data.pickleball_courts || 1,
            colors: {
              kitchen: data.pickleball_kitchen_color,
              court: data.pickleball_court_color
            }
          }}
          onChange={(updates) => handleCourtUpdate('pickleball', updates)}
        />

        <AthleticCourt
          type="basketball"
          data={{
            selected: data.basketball_courts > 0,
            courtCount: data.basketball_courts || 1,
            courtType: data.basketball_court_type,
            colors: { 
              court: data.basketball_court_color,
              lane: data.basketball_lane_color
            },
            threePointLines: data.basketball_three_point_lines || []
          }}
          onChange={(updates) => handleCourtUpdate('basketball', updates)}
        />

        <div className="border p-4 rounded">
          <h4 className="font-medium mb-4">Apron Configuration</h4>
          <ColorSelect
            label="Apron Color"
            value={data.apron_color}
            onChange={(color) => onChange({ ...data, apron_color: color })}
          />
        </div>
      </div>
    </Card>
  );
};

export default CourtDesign;