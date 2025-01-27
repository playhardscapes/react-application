import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Edit
} from 'lucide-react';

const VendorBillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBillDetails = async () => {
      if (!token) return;
      try {
        const response = await fetch(`/api/inventory/vendor-bills/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch bill details');
        const data = await response.json();
        setBill(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetails();
  }, [id, token]);

  const handleMarkAsPaid = async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/inventory/vendor-bills/${id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to mark bill as paid');
      const updatedBill = await response.json();
      setBill(updatedBill);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'paid': return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'overdue': return <AlertCircle className="h-6 w-6 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading bill details...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error || !bill) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center text-red-600">
            {error || 'Bill not found'}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-gray-600" />
                <CardTitle className="text-3xl">{bill.bill_number}</CardTitle>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(bill.status)}`}>
                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mt-1">Vendor: {bill.vendor_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate(`/inventory/vendor-bills/${id}/edit`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Bill
              </Button>
              {bill.status === 'pending' && (
                <Button 
                  onClick={handleMarkAsPaid}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="font-medium">
                      {new Date(bill.issue_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-medium">
                      {new Date(bill.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">
                      ${bill.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bill.items.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-4 border rounded"
                  >
                    <div>
                      <p className="font-medium">{item.material_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} @ ${item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${(item.quantity * item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {bill.additional_charges?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bill.additional_charges.map((charge, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-4 border rounded"
                    >
                      <div>
                        <p className="font-medium">{charge.type}</p>
                        <p className="text-sm text-gray-600">{charge.description}</p>
                      </div>
                      <p className="font-medium">
                        ${charge.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {bill.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{bill.notes}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default VendorBillDetail;