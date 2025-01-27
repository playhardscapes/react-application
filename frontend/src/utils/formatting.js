 
// src/utils/formatting.js

export const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatArea = (sqFt = 0) => {
  return `${Math.round(sqFt).toLocaleString()} sq ft`;
};

export const formatDimensions = (length = 0, width = 0) => {
  return `${Math.round(length)}' × ${Math.round(width)}'`;
};

export const formatPercentage = (value = 0, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatPhoneNumber = (input = '') => {
  const cleaned = input.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return input;
};

export const formatHours = (hours = 0) => {
  const days = Math.floor(hours / 8);
  const remainingHours = hours % 8;

  if (days === 0) return `${hours} hours`;
  if (remainingHours === 0) return `${days} days`;
  return `${days} days, ${remainingHours} hours`;
};

export const slugify = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};
