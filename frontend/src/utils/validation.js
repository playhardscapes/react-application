 
// src/utils/validation.js

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const validateRequiredFields = (data, fields) => {
  const errors = {};
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = 'This field is required';
    }
  });
  return errors;
};

export const validateDimensions = (dimensions) => {
  const errors = {};

  if (!dimensions.length || dimensions.length <= 0) {
    errors.length = 'Length must be greater than 0';
  }

  if (!dimensions.width || dimensions.width <= 0) {
    errors.width = 'Width must be greater than 0';
  }

  return errors;
};

export const validateArea = (area, totalArea) => {
  if (!area || area <= 0) {
    return 'Area must be greater than 0';
  }
  if (area > totalArea) {
    return `Area cannot exceed total court area (${totalArea} sq ft)`;
  }
  return null;
};

export const validateProjectData = (projectData) => {
  return {
    clientInfo: validateClientInfo(projectData.clientInfo),
    dimensions: validateDimensions(projectData.dimensions),
    surfaceSystem: validateSurfaceSystem(projectData.surfaceSystem, projectData.dimensions),
    logistics: validateLogistics(projectData.logistics)
  };
};

const validateClientInfo = (clientInfo) => {
  const errors = {};

  if (!clientInfo.name) errors.name = 'Name is required';
  if (!clientInfo.email) errors.email = 'Email is required';
  else if (!validateEmail(clientInfo.email)) errors.email = 'Invalid email format';
  if (!clientInfo.phone) errors.phone = 'Phone is required';
  else if (!validatePhone(clientInfo.phone)) errors.phone = 'Invalid phone format';
  if (!clientInfo.projectLocation) errors.projectLocation = 'Project location is required';

  return errors;
};

const validateSurfaceSystem = (surfaceSystem, dimensions) => {
  const errors = {};
  const totalArea = dimensions.squareFootage || 0;

  if (surfaceSystem.fiberglassMesh?.needed) {
    const areaError = validateArea(surfaceSystem.fiberglassMesh.area, totalArea);
    if (areaError) errors.fiberglassMesh = areaError;
  }

  if (surfaceSystem.cushionSystem?.needed) {
    const areaError = validateArea(surfaceSystem.cushionSystem.area, totalArea);
    if (areaError) errors.cushionSystem = areaError;
  }

  return errors;
};

const validateLogistics = (logistics) => {
  const errors = {};

  if (!logistics.estimatedDays || logistics.estimatedDays < 1) {
    errors.estimatedDays = 'Must have at least 1 day';
  }

  if (!logistics.numberOfTrips || logistics.numberOfTrips < 1) {
    errors.numberOfTrips = 'Must have at least 1 trip';
  }

  if (logistics.hotelRate < 0) {
    errors.hotelRate = 'Hotel rate cannot be negative';
  }

  return errors;
};
