import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const ReceivePOMaterials = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [locations, setLocations] = useState([]);
  const [receivedItems, setReceivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        console.log('Fetching orders and locations...');
        
        const [ordersResponse, locationsResponse] = await Promise.all([
          fetch('/api/inventory/orders?status=ordered,partially_received', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/inventory/locations', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (!ordersResponse.ok || !locationsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [ordersData, locationsData] = await Promise.all([
          ordersResponse.json(),
          locationsResponse.json()
        ]);

        const validOrders = ordersData.filter(order => order.items?.length > 0);
        setOrders(validOrders);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedOrder?.items) {
      setReceivedItems(selectedOrder.items.map(item => ({
        ...item,
        receivedQuantity: 0,
        locationId: null
      })));
    } else {
      setReceivedItems([]);
    }
  }, [selectedOrder]);

  const handleQuantityChange = (index, quantity) => {
    const newReceivedItems = [...receivedItems];
    newReceivedItems[index].receivedQuantity = parseFloat(quantity) || 0;
    setReceivedItems(newReceivedItems);
  };

  const handleLocationChange = (index, locationId) => {
    const newReceivedItems = [...receivedItems];
    newReceivedItems[index].locationId = locationId;
    setReceivedItems(newReceivedItems);
  };

  const handleSubmit = async () => {
    if (!token) return;
    
    setSubmitting(true);
    try {
      const transactions = receivedItems
        .filter(item => item.receivedQuantity > 0 && item.locationId)
        .map(item => ({
          purchaseOrderId: selectedOrder.id,
          purchaseOrderItemId: item.id,
          materialId: item.material_id,
          quantity: item.receivedQuantity,
          locationId: item.locationId,
          unitPrice: item.unit_price,
          notes: `Received from PO #${selectedOrder.order_number}`
        }));

      const receiveResponse = await fetch('/api/materials/receive', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transactions })
      });

      if (!receiveResponse.ok) {
        throw new Error('Failed to receive materials');
      }

      const totalOrderedQuantity = selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalReceivedQuantity = transactions.reduce((sum, item) => sum + item.quantity, 0);
      const newStatus = totalReceivedQuantity >= totalOrderedQuantity ? 'received' : 'partially_received';

      const statusResponse = await fetch(`/api/inventory/orders/${selectedOrder.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to update order status');
      }

      navigate('/inventory/orders');
    } catch (error) {
      console.error('Error receiving materials:', error);
      setError('Failed to process materials receipt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Receive Materials from Purchase Order</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/inventory/materials')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrderSelect 
            orders={orders}
            selectedOrder={selectedOrder}
            onOrderSelect={(value) => {
              const order = orders.find(o => o.id.toString() === value);
              setSelectedOrder(order);
            }}
          />

          {selectedOrder && (
            <ReceiveForm 
              selectedOrder={selectedOrder}
              receivedItems={receivedItems}
              locations={locations}
              onQuantityChange={handleQuantityChange}
              onLocationChange={handleLocationChange}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

const LoadingState = () => (
  <PageContainer>
    <Card>
      <CardContent className="flex justify-center items-center min-h-[200px]">
        <p>Loading purchase orders...</p>
      </CardContent>
    </Card>
  </PageContainer>
);

const ErrorState = ({ error }) => (
  <PageContainer>
    <Card>
      <CardContent className="text-center text-red-500 my-8">
        {error}
      </CardContent>
    </Card>
  </PageContainer>
);

const OrderSelect = ({ orders, selectedOrder, onOrderSelect }) => (
  <div className="w-full">
    <label className="block text-sm font-medium mb-1">Select Purchase Order</label>
    <Select
      value={selectedOrder ? selectedOrder.id.toString() : ''}
      onValueChange={onOrderSelect}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a Purchase Order" />
      </SelectTrigger>
      <SelectContent>
        {orders.length > 0 ? (
          orders.map(order => (
            <SelectItem key={order.id} value={order.id.toString()}>
              PO#{order.order_number} - {order.vendor_name} 
              {order.status === 'partially_received' && ' (Partially Received)'}
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-center text-gray-500">
            No purchase orders available
          </div>
        )}
      </SelectContent>
    </Select>
  </div>
);

const ReceiveForm = ({ 
  selectedOrder, 
  receivedItems, 
  locations, 
  onQuantityChange,
  onLocationChange,
  onSubmit,
  submitting 
}) => (
  <div className="space-y-4">
    <OrderSummary order={selectedOrder} />
    <MaterialsList 
      items={selectedOrder.items}
      receivedItems={receivedItems}
      locations={locations}
      onQuantityChange={onQuantityChange}
      onLocationChange={onLocationChange}
    />
    <div className="flex justify-end">
      <Button
        onClick={onSubmit}
        disabled={
          submitting ||
          !receivedItems.some(item => item.receivedQuantity > 0 && item.locationId)
        }
      >
        {submitting ? 'Receiving...' : 'Receive Materials'}
      </Button>
    </div>
  </div>
);

const OrderSummary = ({ order }) => (
  <Card>
    <CardContent className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Vendor</p>
          <p className="font-medium">{order.vendor_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Expected Delivery</p>
          <p className="font-medium">
            {order.expected_delivery
              ? new Date(order.expected_delivery).toLocaleDateString()
              : 'Not specified'}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const MaterialsList = ({ 
  items, 
  receivedItems, 
  locations,
  onQuantityChange,
  onLocationChange 
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Receive Materials</h3>
    {items.map((item, index) => (
      <MaterialItem 
        key={item.id || index}
        item={item}
        receivedItem={receivedItems[index]}
        locations={locations}
        onQuantityChange={(value) => onQuantityChange(index, value)}
        onLocationChange={(value) => onLocationChange(index, value)}
      />
    ))}
  </div>
);

const MaterialItem = ({ 
  item, 
  receivedItem, 
  locations,
  onQuantityChange,
  onLocationChange 
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <p className="text-sm font-medium">{item.m_name || 'Unnamed Material'}</p>
          <p className="text-sm text-gray-600">
            Ordered: {item.quantity} {item.unit || 'units'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Received Quantity
          </label>
          <Input
            type="number"
            value={receivedItem?.receivedQuantity || 0}
            onChange={(e) => onQuantityChange(e.target.value)}
            min="0"
            max={item.quantity}
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Location
          </label>
          <Select
            value={receivedItem?.locationId?.toString() || ''}
            onValueChange={onLocationChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem
                  key={location.id}
                  value={location.id.toString()}
                >
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ReceivePOMaterials;