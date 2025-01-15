// src/components/estimator/sections/ClientSection.jsx
import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import { Link } from 'react-router-dom';
import clientService from '@/api/clientService';

const ClientSection = ({ data, onChange, errors = {} }) => {
  const [clients, setClients] = useState([]);
  const [clientLoading, setClientLoading] = useState(true);
  const [localLocation, setLocalLocation] = useState(data?.project_location || '');
  const [loadingMileage, setLoadingMileage] = useState(false);
  const [error, setError] = useState(null);

  // Initial client fetch and selection
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientService.fetchClients();
        setClients(response.clients || []);
        
        // If we have a client_id in the data, find and select that client
        if (data?.client_id) {
          const selectedClient = (response.clients || []).find(
            client => client.id === data.client_id
          );
          if (selectedClient) {
            onChange({
              ...data,
              client_id: selectedClient.id,
              client_name: selectedClient.name || '',
              client_email: selectedClient.email || '',
              client_phone: selectedClient.phone || '',
              isClientSelected: true
            });
          }
        }
        setClientLoading(false);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClientLoading(false);
      }
    };

    fetchClients();
  }, [data?.client_id]); // Add client_id as dependency

  // Mileage calculation
  const debouncedFetchMileage = React.useCallback(
    debounce(async (location) => {
      if (!location.trim()) return;

      setLoadingMileage(true);
      setError(null);

      try {
        const response = await fetch('/api/mileage/mileage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: 'Roanoke, VA',
            destination: location,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          const updatedLogistics = {
            ...(data.logistics || {}),
            distanceToSite: result.distanceInMiles,
          };

          onChange({
            ...data,
            project_location: location,
            logistics: updatedLogistics,
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
    if (value.trim()) {
      debouncedFetchMileage(value);
    } else {
      const updatedLogistics = {
        ...(data.logistics || {}),
        distanceToSite: 0,
      };

      onChange({
        ...data,
        project_location: '',
        logistics: updatedLogistics,
      });
    }
  };

  const handleClientSelect = (clientId) => {
    const selectedClient = clients.find((client) => client.id === parseInt(clientId));
    
    if (selectedClient) {
      onChange({
        ...data,
        client_id: selectedClient.id,
        client_name: selectedClient.name || '',
        client_email: selectedClient.email || '',
        client_phone: selectedClient.phone || '',
        isClientSelected: true
      });
    } else {
      onChange({
        ...data,
        client_id: null,
        client_name: '',
        client_email: '',
        client_phone: '',
        isClientSelected: false
      });
    }
  };

  const handleManualFieldChange = (field, value) => {
    if (!data.isClientSelected) {
      onChange({
        ...data,
        [field]: value,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Client Information</h3>
        <Link
          to="/clients/new"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Create New Client
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Client</label>
          <select
            value={data?.client_id || ''}
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={clientLoading}
          >
            <option value="">
              {clientLoading ? 'Loading clients...' : 'Select an existing client'}
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.organization ? `- ${client.organization}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Client Name</label>
          <input
            type="text"
            value={data?.client_name || ''}
            onChange={(e) => handleManualFieldChange('client_name', e.target.value)}
            className={`w-full p-2 border rounded ${
              data.isClientSelected ? 'bg-gray-100' : ''
            } ${errors.client_name ? 'border-red-500' : ''}`}
            placeholder="Full Name"
            disabled={data.isClientSelected}
          />
          {errors.client_name && (
            <p className="text-red-500 text-sm mt-1">{errors.client_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={data?.client_email || ''}
            onChange={(e) => handleManualFieldChange('client_email', e.target.value)}
            className={`w-full p-2 border rounded ${
              data.isClientSelected ? 'bg-gray-100' : ''
            } ${errors.client_email ? 'border-red-500' : ''}`}
            placeholder="client@example.com"
            disabled={data.isClientSelected}
          />
          {errors.client_email && (
            <p className="text-red-500 text-sm mt-1">{errors.client_email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={data?.client_phone || ''}
            onChange={(e) => handleManualFieldChange('client_phone', e.target.value)}
            className={`w-full p-2 border rounded ${
              data.isClientSelected ? 'bg-gray-100' : ''
            } ${errors.client_phone ? 'border-red-500' : ''}`}
            placeholder="(555) 555-5555"
            disabled={data.isClientSelected}
          />
          {errors.client_phone && (
            <p className="text-red-500 text-sm mt-1">{errors.client_phone}</p>
          )}
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
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          {data.logistics?.distanceToSite > 0 && !loadingMileage && (
            <p className="text-sm text-green-600 mt-1">
              Distance: {Math.round(data.logistics.distanceToSite)} miles from Roanoke
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={data?.key_notes || ''}
            onChange={(e) => onChange({ ...data, key_notes: e.target.value })}
            className="w-full p-2 border rounded h-24"
            placeholder="Important details, special requirements..."
          />
        </div>
      </div>
    </div>
  );
};

export default ClientSection;