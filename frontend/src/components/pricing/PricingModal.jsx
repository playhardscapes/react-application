 
// src/components/pricing/PricingModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  createPricingConfiguration,
  updatePricingConfiguration
} from '@/services/pricingService';

const PRICING_CATEGORIES = [
  'materials',
  'services',
  'equipment',
  'labor',
  'misc'
];

const PRICING_UNITS = [
  'per unit',
  'per hour',
  'per sq ft',
  'per item',
  'per project',
  'other'
];

const PricingModal = ({ pricing, isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    value: '',
    unit: '',
    description: ''
  });

  // Populate form when editing existing pricing
  useEffect(() => {
    if (pricing) {
      setFormData({
        name: pricing.name || '',
        category: pricing.category || '',
        value: pricing.value ? pricing.value.toString() : '',
        unit: pricing.unit || '',
        description: pricing.description || ''
      });
    } else {
      // Reset form for new entry
      setFormData({
        name: '',
        category: '',
        value: '',
        unit: '',
        description: ''
      });
    }
  }, [pricing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate inputs
      if (!formData.name || !formData.category || !formData.value) {
        toast({
          title: "Validation Error",
          description: "Name, Category, and Value are required",
          variant: "destructive"
        });
        return;
      }

      // Determine if creating or updating
      const submitFunc = pricing ? updatePricingConfiguration : createPricingConfiguration;

      const payload = {
        ...formData,
        value: parseFloat(formData.value)
      };

      // If updating, include the ID
      if (pricing) {
        await submitFunc(pricing.id, payload);
      } else {
        await submitFunc(payload);
      }

      // Refresh the list and close modal
      onRefresh();
      onClose();

      // Show success toast
      toast({
        title: "Success",
        description: pricing
          ? "Pricing configuration updated successfully"
          : "Pricing configuration created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save pricing configuration",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pricing ? 'Edit Pricing Configuration' : 'Create Pricing Configuration'}
          </DialogTitle>
          <DialogDescription>
            {pricing
              ? 'Update the details of this pricing configuration'
              : 'Add a new pricing configuration to the system'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter configuration name"
              required
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(val) => handleSelectChange('category', val)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {PRICING_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Value</Label>
            <Input
              name="value"
              type="number"
              step="0.01"
              value={formData.value}
              onChange={handleChange}
              placeholder="Enter pricing value"
              required
            />
          </div>

          <div>
            <Label>Unit</Label>
            <Select
              value={formData.unit}
              onValueChange={(val) => handleSelectChange('unit', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                {PRICING_UNITS.map(unit => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {pricing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
