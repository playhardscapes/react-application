// src/components/estimates/EstimatesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Archive, Eye, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';

const EstimatesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { toast } = useToast();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('active');
  const [savedNotification, setSavedNotification] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    if (location.state?.savedNotification) {
      setSavedNotification(location.state.savedNotification);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setSavedNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const fetchEstimates = async () => {
    try {
      const response = await fetch(`/api/estimates?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch estimates');
      }

      const data = await response.json();
      setEstimates(data.estimates || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching estimates:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch estimates",
        variant: "destructive"
      });
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEstimates();
    }
  }, [filter, token]);

  const handleArchiveEstimate = async (estimateId) => {
    try {
      const response = await fetch(`/api/estimates/${estimateId}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error('Failed to archive estimate');
      
      setEstimates(prev => prev.map(est => 
        est.id === estimateId ? {...est, status: 'archived'} : est
      ));
      
      toast({
        title: "Success",
        description: "Estimate archived successfully"
      });
    } catch (err) {
      toast({
        title: "Error", 
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const renderActionButtons = (estimate) => {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/estimates/${estimate.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
        {estimate.status !== 'archived' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleArchiveEstimate(estimate.id)}
          >
            <Archive className="h-4 w-4" />
            Archive
          </Button>
        )}
      </>
    );
  };

  if (loading) return <div className="text-center py-4">Loading estimates...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <PageContainer>
      {savedNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          {savedNotification}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Estimates</h1>
        <Button 
          onClick={() => navigate('/estimates/new')}
          className="flex items-center gap-2"
          variant="default"
        >
          <FileText className="h-4 w-4" />
          Create New Estimate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Estimate List</CardTitle>
            <div className="flex items-center space-x-2">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="active">Active Estimates</option>
                <option value="draft">Drafts</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="all">Show All</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {estimates.length === 0 ? (
            <div className="text-center py-4 text-gray-600">
              No estimates found
            </div>
          ) : (
            <div className="space-y-4">
              {estimates.map(estimate => (
                <div key={estimate.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium">
                      Estimate #{estimate.id} - {estimate.client_name || 'Unknown Client'}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {estimate.project_location || 'No Location'}
                      {estimate.square_footage && ` - ${estimate.square_footage} sq ft`}
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                      estimate.status === 'draft' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : estimate.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : estimate.status === 'archived'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {estimate.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderActionButtons(estimate)}
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

export default EstimatesList;