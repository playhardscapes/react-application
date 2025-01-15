// src/components/estimates/EstimatesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Filter,
  CheckCircle
} from 'lucide-react';
import { estimateService } from '@/services/estimateService';

const EstimatesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, draft, active
  const [savedNotification, setSavedNotification] = useState(null);

  useEffect(() => {
    // Check for saved notification from navigation state
    if (location.state?.savedNotification) {
      setSavedNotification(location.state.savedNotification);
      
      // Clear the navigation state to prevent showing the notification again
      window.history.replaceState({}, document.title);

      // Auto-dismiss the notification after 3 seconds
      const timer = setTimeout(() => {
        setSavedNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const fetchedEstimates = await estimateService.fetchEstimates(filter);
        setEstimates(fetchedEstimates);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching estimates:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEstimates();
  }, [filter]);

  const handleDeleteEstimate = async (estimateId) => {
    if (!window.confirm('Are you sure you want to delete this estimate?')) return;

    try {
      await estimateService.deleteEstimate(estimateId);

      // Remove the deleted estimate from the list
      setEstimates(prev => prev.filter(est => est.id !== estimateId));
    } catch (err) {
      console.error('Error deleting estimate:', err);
      alert('Failed to delete estimate');
    }
  };

  if (loading) return <div className="text-center py-4">Loading estimates...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      {savedNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <CheckCircle className="mr-2 h-5 w-5" />
          {savedNotification}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Estimates</h1>
          <Button 
            onClick={() => navigate('/estimate/new')}
            className="flex items-center gap-2"
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
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="all">All Estimates</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
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
          : 'bg-green-100 text-green-800'
      }`}>
        {estimate.status}
      </span>
    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/estimate/${estimate.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEstimate(estimate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstimatesList;