// src/components/clients/ClientList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientList = ({ searchTerm }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Correctly extract clients from the response
        setClients(data.clients || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.organization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  if (loading) return <p className="text-center py-4">Loading clients...</p>;
  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;
  if (clients.length === 0) {
    return <p className="text-center py-4">No clients found</p>;
  }

  return (
    <div className="space-y-4">
      {filteredClients.map(client => (
        <div
          key={client.id}
          className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          onClick={() => navigate(`/clients/${client.id}`)}
        >
          <div>
            <h3 className="font-medium">{client.name}</h3>
            <p className="text-sm text-gray-600">
              {client.organization && `${client.organization} - `}
              {client.city}{client.state && `, ${client.state}`}
            </p>
            {client.type && (
              <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {client.type}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {client.total_projects || 0} Projects
            </p>
            {(client.total_project_value > 0) && (
              <p className="font-medium">
                ${client.total_project_value.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientList;