import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const CardActivity = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState({
    unreconciled: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const fetchActivity = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/finance/cards/unreconciled', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch card activity');
        }
        
        const data = await response.json();
        setActivity(data);
      } catch (error) {
        console.error('Error fetching card activity:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [token]);

  const content = loading ? (
    <div className="flex justify-center items-center min-h-[200px]">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ) : error ? (
    <div className="p-4 text-red-500 text-center">
      {error}
    </div>
  ) : (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Unreconciled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(activity?.totalAmount || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions to Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {activity.unreconciled}
              </div>
              {activity.unreconciled > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/finance/reconciliation')}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Review Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Card Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor and reconcile credit card transactions
              </p>
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default CardActivity;