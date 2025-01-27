import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Warehouse, Plus, AlertCircle } from 'lucide-react';
import AddLocationDialog from './AddLocationDialog';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchLocations = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/inventory/locations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError(error.message || 'Failed to fetch locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [isAuthenticated, navigate, token]);

  const handleAddLocation = async (locationData) => {
    try {
      const response = await fetch('/api/inventory/locations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locationData)
      });

      if (!response.ok) {
        throw new Error('Failed to add location');
      }

      const newLocation = await response.json();
      setLocations(prev => [...prev, newLocation]);
      return newLocation;
    } catch (error) {
      console.error('Error adding location:', error);
      setError(error.message || 'Failed to add location');
      throw error;
    }
  };

  const handleArchiveLocation = async (locationId) => {
    try {
      const response = await fetch(`/api/inventory/locations/${locationId}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to archive location');
      }

      const archivedLocation = await response.json();
      setLocations(prev => prev.filter(loc => loc.id !== archivedLocation.id));
    } catch (error) {
      console.error('Error archiving location:', error);
      setError(error.message || 'Failed to archive location');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading locations...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Material Locations</CardTitle>
            <div className="flex gap-2">
              <AddLocationDialog onAddLocation={handleAddLocation} />
              <Button
                variant="outline"
                onClick={() => navigate('/inventory/locations/archived')}
                className="flex items-center gap-2"
              >
                <Warehouse className="h-4 w-4" />
                Archived Locations
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8">
              <Warehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No locations found</p>
              <p className="text-sm text-gray-500 mt-2">
                Add a new location to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(location => (
                <div
                  key={location.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg mb-2">{location.name}</h3>
                    <Button
                      variant="outline"
                      onClick={() => handleArchiveLocation(location.id)}
                      className="text-red-500 hover:bg-red-100"
                    >
                      Archive
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Type: {location.type || 'N/A'}</p>
                    {location.address && (
                      <p className="mt-1">Address: {location.address}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Created: {new Date(location.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/inventory/locations/${location.id}`)}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default LocationsList;