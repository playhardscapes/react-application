import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ExpenseProcessing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  const receiptId = location.state?.receiptId;

  useEffect(() => {
    if (!receiptId) {
      navigate('/finance/expenses/quick-entry');
      return;
    }

    const fetchReceiptData = async () => {
      try {
        const response = await fetch(`/api/finance/documents/${receiptId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch receipt data');

        const data = await response.json();
        setReceiptData(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [receiptId, token, navigate]);

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="text-red-500 text-center py-8">
            {error}
            <Button
              className="mt-4"
              onClick={() => navigate('/finance/expenses/quick-entry')}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Process Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Receipt Preview */}
            <Card>
              <CardContent>
                {/* Add receipt preview/image here */}
                Receipt Preview Coming Soon
              </CardContent>
            </Card>

            {/* Extracted Data */}
            <Card>
              <CardContent>
                <h3 className="font-medium mb-4">Extracted Information</h3>
                <p>Coming Soon...</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default ExpenseProcessing;