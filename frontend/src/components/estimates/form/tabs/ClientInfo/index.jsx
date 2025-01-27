// src/components/estimator/EstimationForm/tabs/ClientInfo/index.jsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ClientInfo = ({ data = {}, onChange }) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(data?.project_location || '');
  const [loadingMileage, setLoadingMileage] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/clients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch clients');

        const responseData = await response.json();
        setClients(responseData.clients || []);
        
        if (data?.client_id) {
          const selectedClient = (responseData.clients || []).find(
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
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch clients",
          variant: "destructive"
        });
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [token, data?.client_id]);

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

  const debouncedFetchMileage = React.useCallback(
    debounce(async (location) => {
      if (!location.trim()) return;
      
      setLoadingMileage(true);
      try {
        const response = await fetch('/api/mileage/mileage', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
        }
      } catch (err) {
        console.error('Mileage calculation error:', err);
        toast({
          title: "Error",
          description: "Failed to calculate mileage",
          variant: "destructive"
        });
      } finally {
        setLoadingMileage(false);
      }
    }, 1000),
    [data, onChange, token]
  );

  const handleLocationChange = (value) => {
    setLocation(value);
    if (value.trim()) {
      debouncedFetchMileage(value);
    } else {
      onChange({
        ...data,
        project_location: '',
        logistics: {
          ...(data.logistics || {}),
          distanceToSite: 0
        }
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Client Information</h3>
          <Link to="/clients/new" className="text-blue-600 hover:text-blue-800">
            + New Client
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Client</label>
            <select
              value={data?.client_id || ''}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="">{loading ? 'Loading clients...' : 'Select an existing client'}</option>
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
              onChange={(e) => !data.isClientSelected && onChange({ ...data, client_name: e.target.value })}
              className={`w-full p-2 border rounded ${data.isClientSelected ? 'bg-gray-100' : ''}`}
              placeholder="Full Name"
              disabled={data.isClientSelected}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={data?.client_email || ''}
              onChange={(e) => !data.isClientSelected && onChange({ ...data, client_email: e.target.value })}
              className={`w-full p-2 border rounded ${data.isClientSelected ? 'bg-gray-100' : ''}`}
              placeholder="client@example.com"
              disabled={data.isClientSelected}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={data?.client_phone || ''}
              onChange={(e) => !data.isClientSelected && onChange({ ...data, client_phone: e.target.value })}
              className={`w-full p-2 border rounded ${data.isClientSelected ? 'bg-gray-100' : ''}`}
              placeholder="(555) 555-5555"
              disabled={data.isClientSelected}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter location"
            />
            {loadingMileage && (
              <p className="text-sm text-blue-500 mt-1">Calculating distance...</p>
            )}
            {data.logistics?.distanceToSite > 0 && !loadingMileage && (
              <p className="text-sm text-gray-600 mt-1">
                Distance: {Math.round(data.logistics.distanceToSite)} miles from Roanoke
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={data?.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              className="w-full p-2 border rounded h-24"
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ClientInfo;