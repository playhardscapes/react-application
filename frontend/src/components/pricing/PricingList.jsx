// src/components/pricing/PricingList.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  EditIcon,
  TrashIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import PricingModal from './PricingModal';
import {
  getPricingConfigurations,
  deletePricingConfiguration
} from '@/services/pricingService';

const PricingList = () => {
  const [pricings, setPricings] = useState([]);
  const [filteredPricings, setFilteredPricings] = useState([]);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch pricing configurations
  useEffect(() => {
    const fetchPricings = async () => {
      try {
        setLoading(true);
        const data = await getPricingConfigurations();
        setPricings(data);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(p => p.category))];
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing configurations:', err);
        setError(err.message || 'Failed to fetch pricing configurations');
        setPricings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricings();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = pricings;

    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (filter) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.description?.toLowerCase().includes(filter.toLowerCase())
      );
    }

    setFilteredPricings(result);
  }, [pricings, categoryFilter, filter]);

  // Delete pricing configuration
  const handleDelete = async (id) => {
    try {
      await deletePricingConfiguration(id);
      setPricings(pricings.filter(p => p.id !== id));
      // Optionally show a success toast
    } catch (err) {
      console.error('Error deleting pricing configuration:', err);
      // Optionally show an error toast
    }
  };

  // Edit pricing configuration
  const handleEdit = (pricing) => {
    setSelectedPricing(pricing);
    setIsModalOpen(true);
  };

  // Create new pricing configuration
  const handleCreate = () => {
    setSelectedPricing(null);
    setIsModalOpen(true);
  };

  // Refresh pricing list after modal action
  const handleRefresh = async () => {
    try {
      const data = await getPricingConfigurations();
      setPricings(data);

      // Update categories
      const uniqueCategories = [...new Set(data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error refreshing pricing configurations:', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading pricing configurations...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pricing Configurations</CardTitle>
            <Button onClick={handleCreate}>
              <PlusIcon className="mr-2 h-4 w-4" /> New Configuration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Search configurations..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-grow"
            />
          </div>

          {/* Pricing Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPricings.map((pricing) => (
                <TableRow key={pricing.id}>
                  <TableCell>{pricing.name}</TableCell>
                  <TableCell>{pricing.category}</TableCell>
                  <TableCell>{pricing.value}</TableCell>
                  <TableCell>{pricing.unit || 'N/A'}</TableCell>
                  <TableCell>{pricing.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(pricing)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(pricing.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Configuration Modal */}
      {isModalOpen && (
        <PricingModal
          pricing={selectedPricing}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default PricingList;
