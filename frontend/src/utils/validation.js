 
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

// src/utils/validation.js - Update the validateSurfaceSystem function

// Make validateSurfaceSystem a public export
export const validateSurfaceSystem = (surfaceSystem, dimensions) => {
  const errors = {};
  const totalArea = dimensions.squareFootage || 0;

  // Patch Work validation
  if (surfaceSystem.patch_work_needed) {
    if (!surfaceSystem.patch_work_gallons || surfaceSystem.patch_work_gallons <= 0) {
      errors.patch_work_gallons = 'Patch work gallons required';
    }

    if (surfaceSystem.minor_crack_gallons < 0) {
      errors.minor_crack_gallons = 'Cannot be negative';
    }

    if (surfaceSystem.major_crack_gallons < 0) {
      errors.major_crack_gallons = 'Cannot be negative';
    }

    // Validate total gallons doesn't exceed reasonable amount
    const totalGallons = (surfaceSystem.patch_work_gallons || 0) + 
                        (surfaceSystem.minor_crack_gallons || 0) + 
                        (surfaceSystem.major_crack_gallons || 0);
                        
    if (totalGallons > totalArea / 20) { // 1 gallon covers ~20 sq ft
      errors.patch_work_gallons = 'Total gallons exceeds reasonable amount for court size';
    }
  }

  // Fiberglass Mesh validation
  if (surfaceSystem.fiberglass_mesh_needed) {
    if (!surfaceSystem.fiberglass_mesh_area || surfaceSystem.fiberglass_mesh_area <= 0) {
      errors.fiberglass_mesh_area = 'Area required';
    } else if (surfaceSystem.fiberglass_mesh_area > totalArea) {
      errors.fiberglass_mesh_area = 'Area cannot exceed court size';
    }
  }

  // Cushion System validation
  if (surfaceSystem.cushion_system_needed) {
    if (!surfaceSystem.cushion_system_area || surfaceSystem.cushion_system_area <= 0) {
      errors.cushion_system_area = 'Area required';
    } else if (surfaceSystem.cushion_system_area > totalArea) {
      errors.cushion_system_area = 'Area cannot exceed court size';
    }
  }

  return errors;
};


const validateLogistics = (logistics) => {
  const errors = {};

  if (logistics.travelDays === undefined || logistics.travelDays < 1) {
    errors.travelDays = 'Must have at least 1 day';
  }

  if (!logistics.numberOfTrips || logistics.numberOfTrips < 1) {
    errors.numberOfTrips = 'Must have at least 1 trip';
  }

  if (logistics.hotelRate < 0) {
    errors.hotelRate = 'Hotel rate cannot be negative';
  }

  return errors;
};
