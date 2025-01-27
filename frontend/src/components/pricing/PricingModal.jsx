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
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  createPricingConfiguration,
  updatePricingConfiguration
} from '@/services/pricingService';

// Centralized configuration for pricing categories and units
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
  const { token } = useAuth(); // Get authentication token
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Prevent multiple submissions
      if (isSubmitting) return;
  
      // Validate inputs
      if (!formData.name || !formData.category || !formData.value) {
        toast({
          title: "Validation Error",
          description: "Name, Category, and Value are required",
          variant: "destructive"
        });
        return;
      }
  
      // Validate value is a positive number
      const numericValue = parseFloat(formData.value);
      if (isNaN(numericValue) || numericValue <= 0) {
        toast({
          title: "Validation Error",
          description: "Value must be a positive number",
          variant: "destructive"
        });
        return;
      }
  
      setIsSubmitting(true);
  
      const payload = {
        ...formData,
        value: numericValue
      };
  
      // Use token for authentication
      if (pricing) {
        await updatePricingConfiguration(pricing.id, payload, token);
      } else {
        await createPricingConfiguration(payload, token);
      }
  
      // Show success toast
      toast({
        title: "Success",
        description: pricing
          ? "Pricing configuration updated successfully"
          : "Pricing configuration created successfully"
      });
  
      // Only close and refresh if we made it here without errors
      onRefresh();
      onClose();
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save pricing configuration",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
              maxLength={100} // Add max length for name
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
              min="0"
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
              maxLength={500} // Add max length for description
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {pricing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;