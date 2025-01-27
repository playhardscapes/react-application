// src/components/inventory/orders/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Send } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/inventory/orders/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order details"
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrder();
  }, [id, token]);

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[200px]">
            <p>Loading order details...</p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[200px]">
            <p>Order not found</p>
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
    <CardTitle> {order.order_number || `#${order.id}`}</CardTitle>
    <div className="flex gap-4">
      <Button
        onClick={() => navigate('/inventory/orders')}
        variant="outline"
      >
        Back
      </Button>
      <Button
        onClick={() => navigate(`/inventory/orders/${id}/edit`)}
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        Edit Order
      </Button>
      {order.status === 'draft' && (
        <Button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate(`/inventory/orders/${id}/edit`)}
        >
          <Send className="h-4 w-4" />
          Send to Vendor
        </Button>
      )}
    </div>
  </div>
</CardHeader>

        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-end">
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
              ${order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                order.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                order.status === 'received' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'}`}
            >
              {order.status}
            </span>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vendor Information</h3>
              <p className="text-gray-600">{order.vendor_name}</p>
              <p className="text-gray-600">{order.vendor_email}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Information</h3>
              <p className="text-gray-600">
                Expected Delivery: {new Date(order.expected_delivery).toLocaleDateString()}
              </p>
              <p className="text-gray-600">Created: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {item.material_name}
                        {item.notes && (
                          <p className="text-sm text-gray-500">{item.notes}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                        ${parseFloat(item.unit_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-medium">Total:</td>
                    <td className="px-6 py-4 text-right font-bold">
                      ${order.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-600 whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default OrderDetail;