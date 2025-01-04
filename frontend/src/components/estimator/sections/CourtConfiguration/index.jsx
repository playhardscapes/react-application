 
// src/components/estimator/sections/CourtConfiguration/index.jsx
import React from 'react';
import { TennisCourt } from './TennisCourt';
import { PickleballCourt } from './PickleballCourt';
import { BasketballCourt } from './BasketballCourt';
import { ApronConfig } from './ApronConfig';

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

export default CourtConfiguration;
