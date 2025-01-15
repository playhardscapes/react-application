// src/constants/courts/dimensions.js
/**
 * @typedef {Object} CourtDimensions
 * @property {Object} tennis
 * @property {Object} pickleball
 * @property {Object} basketball
 */

/** @type {CourtDimensions} */
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
