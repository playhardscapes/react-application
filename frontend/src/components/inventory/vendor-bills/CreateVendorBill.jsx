import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/PageContainer';

const CreateVendorBill = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receivedOrders, setReceivedOrders] = useState([]);

  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    vendorId: '',
    billNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    items: [],
    additionalCharges: []
  });

  const ADDITIONAL_CHARGE_TYPES = [
    { id: 'freight', name: 'Freight' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'taxes', name: 'Taxes' },
    { id: 'handling', name: 'Handling' },
    { id: 'pallet', name: 'Pallet' },
    { id: 'other', name: 'Other' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const ordersRes = await fetch('/api/inventory/orders?status=received,partially_received', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!ordersRes.ok) {
          throw new Error('Failed to fetch orders');
        }

        const ordersData = await ordersRes.json();
        if (!Array.isArray(ordersData)) {
          throw new Error('Invalid orders data received');
        }

        const processedOrders = ordersData.map(order => ({
          ...order,
          displayName: `PO#${order.order_number} - ${order.vendor_name} - ${new Date().toLocaleDateString()}`
        }));

        setReceivedOrders(processedOrders);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handlePOSelection = async (poId) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/inventory/orders/${poId}/received-items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      
      const poData = await response.json();
      if (!poData.items || !Array.isArray(poData.items)) {
        throw new Error('Invalid order items data');
      }

      const items = poData.items.map(item => ({
        purchaseOrderId: poId,
        materialId: item.material_id,
        materialName: item.material_name || 'Unknown Material',
        receivedQuantity: item.received_quantity || 0,
        quantity: item.received_quantity || 0,
        originalUnitPrice: item.unit_price || 0,
        unitPrice: item.unit_price || 0,
        notes: '',
        totalPrice: ((item.received_quantity || 0) * (item.unit_price || 0)).toFixed(2)
      }));

      setFormData(prev => ({
        ...prev,
        purchaseOrderId: poId,
        vendorId: poData.vendor_id || '',
        items: items,
        additionalCharges: []
      }));
    } catch (error) {
      console.error('Error fetching PO details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const billData = {
        ...formData,
        totalAmount: calculateTotal()
      };

      const response = await fetch('/api/inventory/vendor-bills', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(billData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vendor bill');
      }

      navigate('/inventory/vendor-bills');
    } catch (error) {
      console.error('Error creating vendor bill:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemPriceChange = (index, newPrice) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      unitPrice: newPrice,
      totalPrice: (newItems[index].quantity * newPrice).toFixed(2)
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addAdditionalCharge = () => {
    setFormData(prev => ({
      ...prev,
      additionalCharges: [
        ...prev.additionalCharges,
        { type: '', description: '', amount: '', notes: '' }
      ]
    }));
  };

  const removeAdditionalCharge = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalCharges: prev.additionalCharges.filter((_, i) => i !== index)
    }));
  };

  const handleAdditionalChargeChange = (index, field, value) => {
    const newCharges = [...formData.additionalCharges];
    newCharges[index] = {
      ...newCharges[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, additionalCharges: newCharges }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + parseFloat(item.totalPrice || 0);
    }, 0);
  };

  const calculateAdditionalCharges = () => {
    return formData.additionalCharges.reduce((sum, charge) => {
      return sum + (parseFloat(charge.amount) || 0);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateAdditionalCharges();
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="flex justify-center items-center min-h-[200px]">
            <p>Loading...</p>
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
            <CardTitle>Create Vendor Bill</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/inventory/vendor-bills')}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Bills
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Purchase Order Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Select Received Purchase Order</label>
              <Select
                value={formData.purchaseOrderId}
                onValueChange={handlePOSelection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Purchase Order" />
                </SelectTrigger>
                <SelectContent>
                  {receivedOrders.map(order => (
                    <SelectItem key={order.id} value={order.id.toString()}>
                      {order.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.purchaseOrderId && (
              <>
                {/* Bill Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bill Number</label>
                    <Input
                      value={formData.billNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
                      placeholder="Enter bill number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Issue Date</label>
                    <Input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      min={formData.issueDate}
                      required
                    />
                  </div>
                </div>

                {/* Received Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Received Materials</h3>
                  {formData.items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">{item.materialName}</p>
                            <p className="text-sm text-gray-600">
                              Received Quantity: {item.receivedQuantity}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Unit Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleItemPriceChange(index, e.target.value)}
                                className="pl-8"
                                min="0.01"
                                step="0.01"
                                required
                              />
                            </div>
                            {item.unitPrice !== item.originalUnitPrice && (
                              <p className="text-sm text-orange-600 mt-1">
                                Original Price: ${item.originalUnitPrice}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Additional Charges */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Additional Charges</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addAdditionalCharge}
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Charge
                    </Button>
                  </div>

                  {formData.additionalCharges.map((charge, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <Select
                              value={charge.type}
                              onValueChange={(value) => handleAdditionalChargeChange(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {ADDITIONAL_CHARGE_TYPES.map(type => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <Input
                              value={charge.description}
                              onChange={(e) => handleAdditionalChargeChange(index, 'description', e.target.value)}
                              placeholder="Enter description"
                            />
                          </div>

                          <div className="relative">
                            <label className="block text-sm font-medium mb-1">Amount</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <Input
                                type="number"
                                value={charge.amount}
                                onChange={(e) => handleAdditionalChargeChange(index, 'amount', e.target.value)}
                                className="pl-8"
                                min="0.01"
                                step="0.01"
                                required
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeAdditionalCharge(index)}
                                className="absolute right-0 top-0"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Bill Totals */}
                <div className="space-y-2">
                  <div className="flex justify-end text-sm">
                    <div className="w-48">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Additional Charges:</span>
                        <span>${calculateAdditionalCharges().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Input
                    as="textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="h-24"
                    placeholder="Any additional notes..."
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/inventory/vendor-bills')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || formData.items.length === 0}
                  >
                    {submitting ? 'Creating...' : 'Create Bill'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default CreateVendorBill;