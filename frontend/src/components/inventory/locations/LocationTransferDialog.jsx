// src/components/inventory/locations/LocationTransferDialog.jsx
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LocationTransferDialog = ({ material, locations, onTransfer }) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [open, setOpen] = useState(false);
  
  // Filter out archived locations
  const activeLocations = useMemo(() => 
    locations.filter(location => !location.archived),
    [locations]
  );

  // Get current stock for selected location
  const selectedLocationStock = useMemo(() => {
    if (!fromLocation || !material.stock) return null;
    return material.stock.find(s => s.location_id === parseInt(fromLocation));
  }, [fromLocation, material.stock]);

  const handleTransfer = async () => {
    if (!fromLocation || !toLocation || !quantity) {
      alert('Please fill all fields');
      return;
    }

    if (fromLocation === toLocation) {
      alert('Source and destination locations must be different');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (selectedLocationStock && quantityNum > selectedLocationStock.quantity) {
      alert(`Insufficient stock at source location. Available: ${selectedLocationStock.quantity} ${material.unit}`);
      return;
    }

    const success = await onTransfer({
      materialId: material.id,
      fromLocationId: fromLocation,
      toLocationId: toLocation,
      quantity: quantityNum
    });

    if (success) {
      setOpen(false); // Close dialog on success
      // Reset form
      setFromLocation('');
      setToLocation('');
      setQuantity('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MoreHorizontal className="h-4 w-4" />
          Transfer Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Transfer {material.name} between locations. Current total stock: {material.total_quantity} {material.unit}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>From Location</Label>
            <Select value={fromLocation} onValueChange={setFromLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select source location" />
              </SelectTrigger>
              <SelectContent>
                {activeLocations.map(location => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                    {material.stock?.find(s => s.location_id === location.id)?.quantity > 0 && 
                      ` (${material.stock.find(s => s.location_id === location.id).quantity} ${material.unit})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLocationStock && (
              <p className="text-sm text-gray-500 mt-1">
                Available: {selectedLocationStock.quantity} {material.unit}
              </p>
            )}
          </div>
          <div>
            <Label>To Location</Label>
            <Select value={toLocation} onValueChange={setToLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination location" />
              </SelectTrigger>
              <SelectContent>
                {activeLocations
                  .filter(loc => loc.id.toString() !== fromLocation)
                  .map(location => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                      {material.stock?.find(s => s.location_id === location.id)?.quantity > 0 && 
                        ` (${material.stock.find(s => s.location_id === location.id).quantity} ${material.unit})`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantity to Transfer</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Enter quantity (max: ${selectedLocationStock?.quantity || 0})`}
              min="0.01"
              max={selectedLocationStock?.quantity}
              step="0.01"
            />
          </div>
          <Button onClick={handleTransfer} className="w-full">
            Transfer Stock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationTransferDialog;