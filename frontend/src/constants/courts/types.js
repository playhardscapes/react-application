 
// src/constants/courts/types.js
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
