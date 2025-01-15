// src/components/estimator/sections/CourtConfiguration/index.jsx
import React from 'react';
import { TennisCourt } from './TennisCourt';
import { PickleballCourt } from './PickleballCourt';
import { BasketballCourt } from './BasketballCourt';
import { ApronConfig } from './ApronConfig';

const CourtConfiguration = ({ data = {}, onChange, errors = {} }) => {
  const handleSportsUpdate = (sport, updatedData) => {
    const newState = {
      ...data,
      [`${sport}_courts`]: updatedData.selected ? (updatedData.courtCount || 1) : 0
    };

    if (sport === 'tennis') {
      newState.tennis_court_color = updatedData.colors?.court;
    } else if (sport === 'pickleball') {
      newState.pickleball_kitchen_color = updatedData.colors?.kitchen;
      newState.pickleball_court_color = updatedData.colors?.court;
    } else if (sport === 'basketball') {
      newState.basketball_court_type = updatedData.courtType;
      newState.basketball_court_color = updatedData.colors?.court;
    }

    onChange(newState);
  };

  // Convert database fields to component state
  const formState = {
    sports: {
      tennis: {
        selected: data.tennis_courts > 0,
        courtCount: data.tennis_courts || 0,
        colors: {
          court: data.tennis_court_color
        }
      },
      pickleball: {
        selected: data.pickleball_courts > 0,
        courtCount: data.pickleball_courts || 0,
        colors: {
          kitchen: data.pickleball_kitchen_color,
          court: data.pickleball_court_color
        }
      },
      basketball: {
        selected: data.basketball_courts > 0,
        courtType: data.basketball_court_type,
        colors: {
          court: data.basketball_court_color
        }
      }
    },
    apron: {
      color: data.apron_color
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Court Configuration</h3>

      <TennisCourt
        data={formState.sports.tennis}
        onChange={(tennisData) => handleSportsUpdate('tennis', tennisData)}
        error={errors.tennis_courts}
      />

      <PickleballCourt
        data={formState.sports.pickleball}
        onChange={(pickleballData) => handleSportsUpdate('pickleball', pickleballData)}
        errors={{
          courts: errors.pickleball_courts,
          kitchen: errors.pickleball_kitchen_color,
          court: errors.pickleball_court_color
        }}
      />

      <BasketballCourt
        data={formState.sports.basketball}
        onChange={(basketballData) => handleSportsUpdate('basketball', basketballData)}
        errors={{
          courts: errors.basketball_courts,
          type: errors.basketball_court_type,
          color: errors.basketball_court_color
        }}
      />

      <ApronConfig
        data={formState.apron}
        onChange={(apronData) => onChange({
          ...data,
          apron_color: apronData.color
        })}
        error={errors.apron_color}
      />
    </div>
  );
};

export default CourtConfiguration;