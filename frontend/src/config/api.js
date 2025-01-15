 
// src/config/api.js

// Use environment variable for API base URL, with a fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
