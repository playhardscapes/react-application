import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Search, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useToast } from '@/components/ui/use-toast';

const MaterialsList = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/materials', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        
        const data = await response.json();
        setMaterials(data);
      } catch (error) {
        console.error('Error:', error);
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

    fetchMaterials();
  }, [token, toast, navigate]);

  const categories = ['all', ...new Set(materials.map(m => m.category).filter(Boolean))];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading materials...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Materials</h1>
          <p className="text-gray-600">View and manage inventory materials</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                className="pl-9 w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              No materials found.
            </CardContent>
          </Card>
        ) : (
          filteredMaterials.map(material => (
            <MaterialCard 
              key={material.id}
              material={material}
              onClick={() => navigate(`/inventory/materials/${material.id}`)}
            />
          ))
        )}
      </div>
    </PageContainer>
  );
};

const MaterialCard = ({ material, onClick }) => (
  <Card 
    className="cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{material.name}</h3>
          <p className="text-sm text-gray-600">
            {material.category} - SKU: {material.sku || 'N/A'}
          </p>
          {material.quantity <= material.min_quantity && (
            <div className="flex items-center gap-1 text-red-600 mt-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Low Stock</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-medium">
            {material.total_stock} {material.unit}
          </p>
          <p className="text-sm text-gray-600">
            Min: {material.min_quantity} {material.unit}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default MaterialsList;