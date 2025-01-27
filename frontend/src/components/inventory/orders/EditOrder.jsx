// src/components/inventory/orders/EditOrder.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon, Send, Save } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/PageContainer';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [formData, setFormData] = useState({
    vendorId: '',
    expectedDelivery: '',
    notes: '',
    items: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [orderRes, materialsRes, vendorsRes] = await Promise.all([
          fetch(`/api/inventory/orders/${id}`, { headers }),
          fetch('/api/materials', { headers }),
          fetch('/api/vendors', { headers })
        ]);

        const [orderData, materialsData, vendorsData] = await Promise.all([
          orderRes.json(),
          materialsRes.json(),
          vendorsRes.json()
        ]);

        setMaterials(materialsData);
        setVendors(vendorsData);

        setFormData({
          vendorId: orderData.vendor_id.toString(),
          expectedDelivery: orderData.expected_delivery ? 
            new Date(orderData.expected_delivery).toISOString().split('T')[0] : '',
          notes: orderData.notes || '',
          order_number: orderData.order_number,
          items: orderData.items.map(item => ({
            materialId: item.material_id.toString(),
            quantity: item.quantity.toString(),
            unitPrice: item.unit_price.toString(),
            notes: item.notes || ''
          }))
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order details"
        });
        navigate('/inventory/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, token]);

  useEffect(() => {
    if (formData.vendorId) {
      const vendor = vendors.find(v => v.id.toString() === formData.vendorId.toString());
      setSelectedVendor(vendor);
    }
  }, [formData.vendorId, vendors]);

  const sendOrderEmail = async () => {
    setSubmitting(true);
    try {
      const emailResponse = await fetch('/api/inventory/orders/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: id,
          vendorEmail: selectedVendor.email,
          vendorName: selectedVendor.name
        })
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send order email');
      }

      toast({
        title: "Success",
        description: "Order sent to vendor"
      });
      setShowSendDialog(false);
      navigate(`/inventory/orders/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { materialId: '', quantity: '', unitPrice: '', notes: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (quantity * price);
    }, 0);
  };

  const handleSubmit = async (e, shouldEmail = false) => {
    e.preventDefault();
    if (shouldEmail) {
      setShowSendDialog(true);
      return;
    }
    setShowSaveDialog(true);  // Show save dialog for regular submit
  };

  const submitOrder = async (shouldEmail = false) => {
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/inventory/orders/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: shouldEmail ? 'ordered' : 'draft'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      if (shouldEmail && selectedVendor?.email) {
        await sendOrderEmail();
      } else {
        toast({
          title: "Success",
          description: "Order saved"
        });
      }

      navigate(`/inventory/orders/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSubmitting(false);
      setShowSaveDialog(false);
      setShowSendDialog(false);
    }
  };

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

  return (
    <PageContainer>
      <Card>
      <CardHeader>
  <div className="flex justify-between items-center">
    <CardTitle>Edit {formData.order_number || `#${id}`}</CardTitle>
  </div>
</CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor and Delivery Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVendor && (
                  <p className="text-sm text-gray-500 mt-1">
                    Email: {selectedVendor.email || 'No email available'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expected Delivery</label>
                <Input
                  type="date"
                  value={formData.expectedDelivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Order Items Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Items</h3>
              {formData.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Material</label>
                        <Select
                          value={item.materialId}
                          onValueChange={(value) => handleItemChange(index, 'materialId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map(material => (
                              <SelectItem 
                                key={material.id} 
                                value={material.id.toString()}
                              >
                                {material.name} ({material.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium mb-1">Unit Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="pl-8"
                            min="0.01"
                            step="0.01"
                            required
                          />
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="absolute right-0 top-0"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Total Amount Section */}
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">
                  ${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="h-24"
                placeholder="Any additional notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
  <Button
    type="button"
    variant="outline"
    onClick={() => navigate('/inventory/orders')}
    disabled={submitting}
    className="bg-white hover:bg-gray-100"
  >
    Cancel
  </Button>
  <Button
    type="submit"
    disabled={submitting}
    variant="outline"
    className="bg-white hover:bg-gray-100 flex items-center gap-2"
  >
    <Save className="h-4 w-4" />
    {submitting ? 'Saving...' : 'Save as Draft'}
  </Button>
  <Button
    type="button"
    onClick={(e) => handleSubmit(e, true)}
    disabled={submitting || !selectedVendor?.email}
    className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
  >
    <Send className="h-4 w-4" />
    {submitting ? 'Sending...' : 'Send to Vendor'}
  </Button>
</div>
          </form>


        {/* Send Order Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent className="bg-white border rounded-lg shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold">Save Changes</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Do you want to resend?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              <AlertDialogCancel 
                className="flex-1 max-w-[200px] bg-white hover:bg-gray-100"
              >
                No
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => submitOrder(false)}
                className="flex-1 max-w-[200px] bg-blue-600 text-white hover:bg-blue-700"
              >
                Yes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Send Order Dialog */}
        <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <AlertDialogContent className="bg-white border rounded-lg shadow-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold">Send Order to Vendor</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                This will send the order to {selectedVendor?.name} ({selectedVendor?.email}).
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              <AlertDialogCancel 
                className="flex-1 max-w-[200px] bg-white hover:bg-gray-100"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => submitOrder(true)}
                className="flex-1 max-w-[200px] bg-blue-600 text-white hover:bg-blue-700"
              >
                Send Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default EditOrder;