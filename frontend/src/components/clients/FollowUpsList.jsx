// src/components/clients/FollowUpsList.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';

const FollowUpsList = () => {
  const [followUps, setFollowUps] = useState([]); // Using named import
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const handleComplete = async (id) => {
    try {
      const response = await fetch(`/api/clients/follow-ups/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          completion_notes: 'Marked as completed'
        })
      });
  
      if (!response.ok) throw new Error('Failed to update follow-up');
      
      // Remove the completed follow-up from the list
      setFollowUps(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error completing follow-up:', error);
      setError(error.message);
    }
  }; 

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const response = await fetch('/api/clients/follow-ups/upcoming');
        if (!response.ok) {
          throw new Error('Failed to fetch follow-ups');
        }
        const data = await response.json();
        setFollowUps(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching follow-ups:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, []);

  // Rest of the component remains the same...

  if (loading) return <p className="text-center py-4">Loading follow-ups...</p>;
  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;
  if (!Array.isArray(followUps) || followUps.length === 0) {
    return <p className="text-center py-4">No pending follow-ups</p>;
  }

  // Rest of the component remains the same...

  return (
    <div className="space-y-4">
      {followUps.map(followUp => {
        const isOverdue = new Date(followUp.follow_up_date) < new Date();

        return (
          <div
            key={followUp.id}
            className="flex justify-between items-start p-4 border rounded-lg hover:bg-gray-50"
          >
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{followUp.client_name}</h4>
                {isOverdue && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">{followUp.notes}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                isOverdue
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                Due: {new Date(followUp.follow_up_date).toLocaleDateString()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleComplete(followUp.id);
              }}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Complete
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default FollowUpsList;