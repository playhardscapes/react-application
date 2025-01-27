// src/hooks/useGeocoding.js
import { useState } from 'react';
import loadGoogleMapsAPI from '@/utils/loadGoogleMapsAPI';

export const useGeocoding = () => {
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDistance = async (destination) => {
    if (!destination) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/mileage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'Roanoke, VA',
          destination
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate distance');
      }

      const data = await response.json();
      setDistance(data.distanceInMiles);
      return data.distanceInMiles;
    } catch (err) {
      setError(err.message);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    distance,
    isLoading,
    error,
    calculateDistance
  };
};
