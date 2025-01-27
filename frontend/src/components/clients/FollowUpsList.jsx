// src/components/clients/FollowUpsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';

const FollowUpsList = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [followUps, setFollowUps] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

    const handleComplete = async (id) => {
    if (!token) {
      navigate('/login');
      return;
    }
  
    try {
      const response = await fetch(`/api/clients/follow-ups/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          completion_notes: 'Marked as completed'
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update follow-up');
      }
      
      // Remove the completed follow-up from the list
      setFollowUps(prev => prev.filter(f => f.id !== id));
  
      toast({
        title: 'Follow-up Completed',
        description: 'Follow-up has been marked as completed.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error completing follow-up:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchFollowUps = async () => {
      try {
        const response = await fetch('/api/clients/follow-ups/upcoming', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch follow-ups');
        }

        const data = await response.json();
        setFollowUps(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching follow-ups:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [token, toast]);

  if (loading) return <div>Loading follow-ups...</div>;
  if (error) return <div>Error: {error}</div>;
 
  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Follow-ups</CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(followUps) || followUps.length === 0 ? (
            <p className="text-center py-4">No pending follow-ups</p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default FollowUpsList;