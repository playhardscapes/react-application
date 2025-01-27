import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Warehouse, ArrowLeft } from 'lucide-react';

const ArchivedLocationsList = () => {
  const [archivedLocations, setArchivedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArchivedLocations = async () => {
      try {
        const response = await fetch('/api/inventory/locations/archived');
        if (!response.ok) {
          throw new Error('Failed to fetch archived locations');
        }
        const data = await response.json();
        setArchivedLocations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching archived locations:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchArchivedLocations();
  }, []);

  const handleRestoreLocation = async (locationId) => {
    try {
      const response = await fetch(`/api/inventory/locations/${locationId}/restore`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to restore location');
      }

      const restoredLocation = await response.json();
      setArchivedLocations(prev => prev.filter(loc => loc.id !== restoredLocation.id));
    } catch (error) {
      console.error('Error restoring location:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <Card>
          <CardContent className="p-8 text-center">
            Loading archived locations...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <Card>
          <CardContent className="p-8 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Archived Locations</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/inventory/locations')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Active Locations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {archivedLocations.length === 0 ? (
            <div className="text-center py-8">
              <Warehouse className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No archived locations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedLocations.map(location => (
                <div
                  key={location.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg mb-2">{location.name}</h3>
                    <Button
                      variant="outline"
                      onClick={() => handleRestoreLocation(location.id)}
                      className="text-green-500 hover:bg-green-100"
                    >
                      Restore
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Type: {location.type || 'N/A'}</p>
                    {location.address && (
                      <p className="mt-1">Address: {location.address}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Archived: {new Date(location.archived_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArchivedLocationsList;