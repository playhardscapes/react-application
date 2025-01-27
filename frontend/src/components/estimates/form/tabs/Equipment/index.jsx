// src/components/estimator/EstimationForm/tabs/Equipment/index.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';

const Equipment = ({ data, onChange }) => {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Equipment Selection</h3>

        {/* Tennis Equipment */}
        <div className="space-y-4 border-b pb-4">
          <h4 className="font-medium">Tennis Equipment</h4>
          <div className="space-y-4">
            <NumberInput
              label="Tennis Net Post Sets"
              value={data.tennis_post_sets || 0}
              onChange={(value) => onChange({ ...data, tennis_post_sets: value })}
              min={0}
              helperText="One set includes two posts and net"
            />
            {data.tennis_post_sets > 0 && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.tennis_posts_installation || false}
                  onChange={(e) => onChange({ ...data, tennis_posts_installation: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>Include footer installation for {data.tennis_post_sets} set{data.tennis_post_sets > 1 ? 's' : ''}</span>
              </label>
            )}
          </div>
        </div>

        {/* Pickleball Equipment */}
        <div className="space-y-4 border-b pb-4">
          <h4 className="font-medium">Pickleball Equipment</h4>
          <div className="space-y-4">
            <div>
              <NumberInput
                label="Permanent Net Post Sets"
                value={data.pickleball_post_sets || 0}
                onChange={(value) => onChange({ ...data, pickleball_post_sets: value })}
                min={0}
                helperText="One set includes two posts and net"
              />
              {data.pickleball_post_sets > 0 && (
                <label className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    checked={data.pickleball_posts_installation || false}
                    onChange={(e) => onChange({ ...data, pickleball_posts_installation: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span>Include footer installation for {data.pickleball_post_sets} set{data.pickleball_post_sets > 1 ? 's' : ''}</span>
                </label>
              )}
            </div>

            <NumberInput
              label="Mobile Pickleball Nets"
              value={data.mobile_pickleball_nets || 0}
              onChange={(value) => onChange({ ...data, mobile_pickleball_nets: value })}
              min={0}
              helperText="Includes assembly"
            />
          </div>
        </div>

        {/* Basketball Systems */}
        <div className="space-y-4 border-b pb-4">
          <h4 className="font-medium">Basketball Systems</h4>
          <div className="space-y-4">
            <NumberInput
              label="Adjustable Height - 60″ Backboard"
              value={data.basketball_60_count || 0}
              onChange={(value) => onChange({ ...data, basketball_60_count: value })}
              min={0}
              helperText="Includes assembly"
            />
            <NumberInput
              label="Adjustable Height - 72″ Backboard"
              value={data.basketball_72_count || 0}
              onChange={(value) => onChange({ ...data, basketball_72_count: value })}
              min={0}
              helperText="Includes assembly"
            />
            <NumberInput
              label="Fixed Height Hoops"
              value={data.basketball_fixed_count || 0}
              onChange={(value) => onChange({ ...data, basketball_fixed_count: value })}
              min={0}
              helperText="Includes assembly"
            />

            {(data.basketball_60_count > 0 || data.basketball_72_count > 0 || data.basketball_fixed_count > 0) && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={data.basketball_installation || false}
                  onChange={(e) => onChange({ ...data, basketball_installation: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>Include footer installation for {
                  (data.basketball_60_count || 0) + 
                  (data.basketball_72_count || 0) + 
                  (data.basketball_fixed_count || 0)
                } hoop{
                  ((data.basketball_60_count || 0) + 
                   (data.basketball_72_count || 0) + 
                   (data.basketball_fixed_count || 0)) > 1 ? 's' : ''
                }</span>
              </label>
            )}
          </div>
        </div>

        {/* Windscreen */}
        <div className="space-y-4">
          <h4 className="font-medium">Windscreen</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput
              label="Standard Windscreen"
              value={data.standard_windscreen || 0}
              onChange={(value) => onChange({ ...data, standard_windscreen: value })}
              min={0}
              helperText="Linear feet"
            />
            <NumberInput
              label="High-Grade Windscreen"
              value={data.high_grade_windscreen || 0}
              onChange={(value) => onChange({ ...data, high_grade_windscreen: value })}
              min={0}
              helperText="Linear feet"
            />
          </div>

          {(data.standard_windscreen > 0 || data.high_grade_windscreen > 0) && (
            <label className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                checked={data.windscreen_installation || false}
                onChange={(e) => onChange({ ...data, windscreen_installation: e.target.checked })}
                className="h-4 w-4"
              />
              <span>Include installation for {data.standard_windscreen + data.high_grade_windscreen} linear feet</span>
            </label>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Equipment;