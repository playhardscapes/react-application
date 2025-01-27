import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Warehouse, ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';

const LocationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`/api/inventory/locations/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch location details');
        }

        const data = await response.json();
        setLocation(data);
        setLocationName(data.name);
        setLocationType(data.type);
        setAddress(data.address);
      } catch (error) {
        console.error('Error fetching location details:', error);
        setError(error.message || 'Failed to fetch location details');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetails();
  }, [id, isAuthenticated, navigate, token]);

  const handleSaveChanges = async () => {
    if (!locationName.trim()) {
      setError('Location name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/inventory/locations/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: locationName.trim(),
          type: locationType,
          address: address.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update location');
      }

      const updatedLocation = await response.json();
      setLocation(updatedLocation);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating location:', error);
      setError(error.message || 'Failed to update location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveLocation = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/inventory/locations/${id}/archive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive location');
      }

      navigate('/inventory/locations');
    } catch (error) {
      console.error('Error archiving location:', error);
      setError(error.message || 'Failed to archive location');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading location details...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error || !location) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center text-red-600">
            {error || 'Location not found'}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{location.name}</CardTitle>
              <p className="text-gray-600 text-sm">
                Type: {location.type || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/inventory/locations')}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {!editMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Edit className="h-4 w-4" />
                  Edit Location
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    disabled={isSubmitting}
                    className="text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {error && (
          <Alert variant="destructive" className="mx-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CardContent className="space-y-6">
          {editMode ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Location Type</Label>
                <Select 
                  value={locationType} 
                  onValueChange={setLocationType}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="job_site">Job Site</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location Name</p>
                <p>{location.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location Type</p>
                <p>{location.type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p>{location.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created</p>
                <p>{new Date(location.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>

        {!editMode && (
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleArchiveLocation}
              disabled={isSubmitting}
              className="text-red-500 hover:bg-red-100"
            >
              {isSubmitting ? 'Archiving...' : 'Archive Location'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </PageContainer>
  );
};

export default LocationDetail;