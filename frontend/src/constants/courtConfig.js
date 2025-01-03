 
// src/constants/courtConfig.js

export const COURT_DIMENSIONS = {
  tennis: {
    length: 78,
    width: 36,
    totalArea: 2808
  },
  pickleball: {
    length: 44,
    width: 20,
    totalArea: 880,
    kitchen: {
      length: 14,
      width: 20,
      totalArea: 280
    }
  },
  basketball: {
    full: {
      length: 94,
      width: 50,
      totalArea: 4700
    },
    half: {
      length: 47,
      width: 50,
      totalArea: 2350
    }
  }
};

export const COURT_COLORS = [
  { value: 'dark-green', label: 'Dark Green' },
  { value: 'light-green', label: 'Light Green' },
  { value: 'dark-blue', label: 'Dark Blue' },
  { value: 'light-blue', label: 'Light Blue' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' }
];

export const COURT_TYPES = {
  tennis: {
    label: 'Tennis',
    requiresNets: true,
    standardColors: ['dark-green', 'light-green']
  },
  pickleball: {
    label: 'Pickleball',
    requiresNets: true,
    standardColors: ['light-blue', 'dark-blue']
  },
  basketball: {
    label: 'Basketball',
    requiresNets: false,
    variants: ['half', 'full'],
    standardColors: ['dark-green', 'red']
  }
};
