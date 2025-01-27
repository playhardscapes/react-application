import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ArrowLeft,
  Edit,
  AlertCircle,
  MoreHorizontal,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AddLocationDialog from '../locations/AddLocationDialog';
import { LocationTransferDialog } from '@/components/inventory';
import { PageContainer } from '@/components/layout/PageContainer';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [material, setMaterial] = useState(null);
  const [locations, setLocations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: `/inventory/materials/${id}` },
        replace: true 
      });
      return;
    }

    const fetchMaterialData = async () => {
      try {
        const [materialRes, locationsRes, transactionsRes] = await Promise.all([
          fetch(`/api/materials/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/materials/locations', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`/api/materials/${id}/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        // Handle potential authentication errors
        if (materialRes.status === 401 || locationsRes.status === 401 || transactionsRes.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!materialRes.ok || !locationsRes.ok || !transactionsRes.ok) {
          throw new Error('Failed to fetch material data');
        }

        const materialData = await materialRes.json();
        const locationsData = await locationsRes.json();
        const transactionsData = await transactionsRes.json();

        setMaterial(materialData);
        setLocations(locationsData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching material details:', error);
        
        if (error.message === 'Unauthorized') {
          navigate('/login', { 
            state: { from: `/inventory/materials/${id}` },
            replace: true 
          });
          return;
        }

        setError(error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [id, token, isAuthenticated, navigate]);

  const handleStockTransfer = async (transferData) => {
    try {
      const response = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transferData)
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to transfer stock');
      }
  
      // Refresh material data
      const updatedMaterialRes = await fetch(`/api/materials/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updatedMaterial = await updatedMaterialRes.json();
      setMaterial(updatedMaterial);
      
      return true; // Indicate success
    } catch (error) {
      console.error('Error transferring stock:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to transfer stock'
      });
      return false; // Indicate failure
    }
  };

  const handleAddLocation = async (locationData) => {
    try {
      const response = await fetch('/api/inventory/locations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locationData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to add location');
      }
  
      const newLocation = await response.json();
      setLocations(prev => [...prev, newLocation]);
      toast({
        title: "Success",
        description: "Location added successfully"
      });
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to add location'
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card className="max-w-5xl mx-auto">
          <CardContent className="p-8 text-center">
            Loading material details...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error || !material) {
    return (
      <PageContainer>
        <Card className="max-w-5xl mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-red-600">
              {error || 'Material not found'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/inventory/materials')}
              className="mt-4"
            >
              Back to Materials
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const isLowStock = material.total_quantity <= material.min_quantity;

  return (
    <PageContainer>
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{material.name}</CardTitle>
              <p className="text-gray-600 text-sm">
                {material.category} - SKU: {material.sku || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/inventory/materials')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => navigate(`/inventory/materials/${id}/edit`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Material
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="bg-red-50 p-4 rounded flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Low Stock Warning</p>
                <p className="text-sm">
                  Current stock ({material.total_quantity} {material.unit}) is below minimum level ({material.min_quantity} {material.unit})
                </p>
              </div>
            </div>
          )}

          {/* Material Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Stock Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Quantity</p>
                  <p className="text-2xl font-bold">
                    {material.total_quantity} {material.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Minimum Stock Level</p>
                  <p>{material.min_quantity} {material.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Cost per {material.unit}</p>
                  <p>${material.average_cost_per_gallon ? Number(material.average_cost_per_gallon).toFixed(2) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Purchase</p>
                  <p>{material.last_purchase_date ? new Date(material.last_purchase_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Additional Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p>{material.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">SKU</p>
                  <p>{material.sku || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reorder Point</p>
                  <p>{material.reorder_point || 'N/A'} {material.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Manufacturer</p>
                  <p>{material.manufacturer || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stock by Location */}
          <div className="border-b pb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Stock by Location</h3>
              <div className="flex gap-2">
                
                <LocationTransferDialog 
                  material={material} 
                  locations={locations}
                  onTransfer={handleStockTransfer}
                />
                <AddLocationDialog 
                  onAddLocation={handleAddLocation}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {material.stock.map(stockItem => (
                <Card key={stockItem.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{stockItem.name}</h4>
                        <p className="text-sm text-gray-600">{stockItem.type || 'Location'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {stockItem.quantity} {material.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          Last Counted: {stockItem.last_counted 
                            ? new Date(stockItem.last_counted).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Purchase History */}
          <div>
            <h3 className="text-lg font-medium mb-4">Purchase History</h3>
            <div className="space-y-3">
              {transactions.filter(t => t.transaction_type === 'receive').length === 0 ? (
                <p className="text-center text-gray-600 py-4">
                  No purchase history available
                </p>
              ) : (
                transactions
                  .filter(t => t.transaction_type === 'receive')
                  .map(transaction => (
                    <div 
                      key={transaction.id}
                      className="flex justify-between items-start p-3 border rounded bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">
                          Received {transaction.quantity} {material.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.supplier ? `From: ${transaction.supplier}` : ''}
                          {transaction.invoice_number ? ` (Invoice: ${transaction.invoice_number})` : ''}
                        </p>
                        {transaction.notes && (
                          <p className="text-sm text-gray-600 mt-1">{transaction.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(transaction.unit_price * transaction.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${transaction.unit_price.toFixed(2)} per {material.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Usage History */}
          <div>
            <h3 className="text-lg font-medium mb-4">Usage History</h3>
            <div className="space-y-3">
              {transactions.filter(t => t.transaction_type === 'use').length === 0 ? (
                <p className="text-center text-gray-600 py-4">
                  No usage history available
                </p>
              ) : (
                transactions
                  .filter(t => t.transaction_type === 'use')
                  .map(transaction => (
                    <div 
                      key={transaction.id}
                      className="flex justify-between items-start p-3 border rounded bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">
                          Used {transaction.quantity} {material.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          Location: {transaction.location_name}
                        </p>
                        {transaction.project_title && (
                          <p className="text-sm text-gray-600">
                            Project: {transaction.project_title}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Notes */}
          {material.notes && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Notes</h3>
              <p className="text-gray-600">{material.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default MaterialDetail;