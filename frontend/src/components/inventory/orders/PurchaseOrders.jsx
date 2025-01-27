// src/components/inventory/orders/PurchaseOrders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext'; // Add this import
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusIcon, 
  SearchIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast'; // Add this import

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { token } = useAuth(); // Add this
  const { toast } = useToast(); // Add this
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return; // Add token check

      try {
        const response = await fetch('/api/inventory/orders', {
          headers: {
            'Authorization': `Bearer ${token}` // Add authorization header
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load purchase orders"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]); // Add token to dependencies

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'ordered':
        return 'bg-purple-100 text-purple-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[200px]">
            <p>Loading purchase orders...</p>
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
            <CardTitle>Purchase Orders</CardTitle>
            <Button onClick={() => navigate('/inventory/orders/create')}>
              <PlusIcon className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No orders found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <Card 
                  key={order.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/inventory/orders/${order.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{order.order_number}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Vendor: {order.vendor_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${order.total_amount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        {order.expected_delivery && (
                          <p className="text-sm text-gray-600">
                            Expected: {new Date(order.expected_delivery).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default PurchaseOrders;