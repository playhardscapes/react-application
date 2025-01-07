// src/components/estimates/EstimatesList.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EstimatesList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEstimates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/estimates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEstimates(data);
        setError(null);
      } catch (error) {
        console.error('Error loading estimates:', error);
        setError('Unable to load estimates at this time');
        // Set some dummy data for development
        setEstimates([
          {
            id: 1,
            clientName: 'Example Client',
            date: '2024-01-15',
            location: 'Example Location',
            total: 25000,
            status: 'Pending'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadEstimates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Recent Estimates</h1>
              <p className="text-gray-600">View and manage your estimates</p>
            </div>
            <Button onClick={() => navigate('/estimate/new')}>
              New Estimate
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading estimates...</p>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-600">{error}</p>
              </div>
            ) : estimates.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No estimates found</p>
                <Button 
                  onClick={() => navigate('/estimate/new')}
                  className="mt-4"
                >
                  Create Your First Estimate
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {estimates.map((estimate) => (
                  <div
                    key={estimate.id}
                    className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/estimate/${estimate.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{estimate.clientName}</h3>
                        <p className="text-sm text-gray-600">{estimate.location}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {estimate.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${estimate.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(estimate.date).toLocaleDateString()}
                        </p>
                      </div>
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