import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageContainer } from '@/components/layout/PageContainer';
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

const ADDITIONAL_CHARGE_TYPES = [
  { id: 'freight', name: 'Freight' },
  { id: 'shipping', name: 'Shipping' },
  { id: 'taxes', name: 'Taxes' },
  { id: 'handling', name: 'Handling' },
  { id: 'pallet', name: 'Pallet' },
  { id: 'other', name: 'Other' }
];

const EditVendorBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [formData, setFormData] = useState({
    vendorId: '',
    billNumber: '',
    issueDate: '',
    dueDate: '',
    notes: '',
    items: [],
    additionalCharges: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [billRes, vendorsRes, ordersRes] = await Promise.all([
          fetch(`/api/inventory/vendor-bills/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/vendors', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/inventory/orders?status=received,partially_received', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!billRes.ok || !vendorsRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [receivedOrders, setReceivedOrders] = useState([]);

// Update formData structure
const [formData, setFormData] = useState({
  purchaseOrderId: '',
  vendorId: '',
  billNumber: '',
  issueDate: '',
  dueDate: '',
  notes: '',
  items: [],
  additionalCharges: []
});
      } catch (error) {
        console.error('Error:', error);
        navigate('/inventory/vendor-bills');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/inventory/vendor-bills/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          totalAmount: calculateTotal()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update bill');
      }

      navigate(`/inventory/vendor-bills/${id}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateItemsTotal = () => 
    formData.items.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0);

  const calculateChargesTotal = () => 
    formData.additionalCharges.reduce((sum, charge) => 
      sum + (parseFloat(charge.amount) || 0), 0);

  const calculateTotal = () => calculateItemsTotal() + calculateChargesTotal();

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
    setFormData(prev => {
      const newCharges = [...prev.additionalCharges];
      newCharges[index] = { ...newCharges[index], [field]: value };
      return { ...prev, additionalCharges: newCharges };
    });
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

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl">Edit Vendor Bill</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>

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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Purchase Order Items</h3>
              </div>
              {formData.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <Select
                      value={item.purchaseOrderId}
                      onValueChange={(value) => {
                        const newItems = [...formData.items];
                        const order = purchaseOrders.find(o => o.id.toString() === value);
                        if (order) {
                          newItems[index] = {
                            ...item,
                            purchaseOrderId: value,
                            materialId: order.material_id?.toString() || '',
                            quantity: order.received_quantity?.toString() || '',
                            unitPrice: order.unit_price?.toString() || ''
                          };
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Purchase Order" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchaseOrders.map(order => (
                          <SelectItem key={order.id} value={order.id.toString()}>
                            PO#{order.order_number} - {order.material_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}
            </div>

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

            <div className="flex justify-end">
              <div className="text-right space-y-1">
                <div className="flex justify-between gap-8">
                  <span className="text-gray-600">Items Total:</span>
                  <span>${calculateItemsTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-gray-600">Additional Charges:</span>
                  <span>${calculateChargesTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-8 text-lg font-bold border-t pt-1">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes..."
                className="h-24"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Editing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center gap-4">
            <AlertDialogCancel className="flex-1 max-w-[200px]">No</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate(`/inventory/vendor-bills/${id}`)}
              className="flex-1 max-w-[200px]"
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default EditVendorBill;