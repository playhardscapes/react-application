// src/components/estimator/sections/ClientSection.jsx
import React, { useState } from 'react';
import { debounce } from 'lodash';

const ClientSection = ({ data, onChange }) => {
  const [localLocation, setLocalLocation] = useState(data.projectLocation || '');
  const [loadingMileage, setLoadingMileage] = useState(false);
  const [error, setError] = useState(null);

  const debouncedFetchMileage = React.useCallback(
    debounce(async (location) => {
      if (!location.trim()) return;

      setLoadingMileage(true);
      setError(null);
      
      try {
        const response = await fetch('http://localhost:5000/api/mileage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: 'Roanoke, VA',
            destination: location,
          }),
        });
        
        const result = await response.json();
        console.log('Mileage API response:', result);
        
        if (response.ok) {
          // Just update clientInfo section, let EstimationWizard handle logistics
          onChange({
            ...data,
            projectLocation: location,
            distanceToSite: result.distanceInMiles
          });
          setError(null);
        } else {
          setError(result.error || 'Unable to calculate mileage.');
        }
      } catch (err) {
        console.error('Mileage calculation error:', err);
        setError('Unable to calculate mileage. Please check the location.');
      } finally {
        setLoadingMileage(false);
      }
    }, 1000),
    [data, onChange]
);

  const handleLocationChange = (value) => {
    setLocalLocation(value);
    debouncedFetchMileage(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Client Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client Name</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="Full Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="(555) 555-5555"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project Location</label>
          <input
            type="text"
            value={localLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="City, State"
          />
          {loadingMileage && (
            <p className="text-sm text-blue-500 mt-1">Calculating distance...</p>
          )}
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
          {data.distanceToSite > 0 && !loadingMileage && (
            <p className="text-sm text-green-600 mt-1">
              Distance: {Math.round(data.distanceToSite)} miles from Roanoke
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={data.keyNotes || ''}
            onChange={(e) => onChange({ ...data, keyNotes: e.target.value })}
            className="w-full p-2 border rounded h-24"
            placeholder="Important details, special requirements..."
          />
        </div>
      </div>
    </div>
  );
};

export default ClientSection;