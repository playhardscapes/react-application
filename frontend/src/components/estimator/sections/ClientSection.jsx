// ClientSection.jsx
import React, { useState, useEffect } from 'react';

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const ClientSection = ({ data, onChange }) => {
  const [localLocation, setLocalLocation] = useState(data.projectLocation || '');
  const [distanceToSite, setDistanceToSite] = useState(data.distanceToSite || 0);
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
        if (response.ok) {
          onChange({
            ...data,
            projectLocation: location,
            distanceToSite: result.distanceInMiles,
          });
          setDistanceToSite(result.distanceInMiles);
          setError(null);
        } else {
          setError(result.error || 'Unable to calculate mileage.');
        }
      } catch (err) {
        setError('Unable to calculate mileage. Please check the location.');
      } finally {
        setLoadingMileage(false);
      }
    }, 1000),
    [data, onChange]
  );

  const handleLocationChange = (value) => {
    setLocalLocation(value);
    onChange({ ...data, projectLocation: value });
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
            placeholder="Full Name"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="client@example.com"
            value={data.email || ''}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            placeholder="(555) 555-5555"
            value={data.phone || ''}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Project Location</label>
          <input
            type="text"
            placeholder="City, State"
            value={localLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mileage (from Roanoke, VA)</label>
          <input
            type="text"
            value={distanceToSite.toFixed(2)}
            readOnly
            className={`w-full p-2 border rounded ${loadingMileage ? 'text-gray-500' : ''}`}
          />
          {loadingMileage && <p className="text-sm text-gray-500">Calculating mileage...</p>}
          {!loadingMileage && error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={data.keyNotes || ''}
            onChange={(e) => onChange({ ...data, keyNotes: e.target.value })}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Important details, special requirements..."
          />
        </div>
      </div>
    </div>
  );
};

export default ClientSection;
