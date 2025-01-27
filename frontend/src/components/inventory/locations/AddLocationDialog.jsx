import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Warehouse } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AddLocationDialog = ({ onAddLocation }) => {
  const [open, setOpen] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationType, setLocationType] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async () => {
    // Validate location name
    if (!locationName.trim()) {
      alert('Location name is required');
      return;
    }

    try {
      const locationData = {
        name: locationName.trim(),
        type: locationType || null,
        address: address.trim() || null
      };

      // Call the passed onAddLocation function
      await onAddLocation(locationData);

      // Reset form
      setLocationName('');
      setLocationType('');
      setAddress('');

      // Close the dialog
      setOpen(false);
    } catch (error) {
      console.error('Error adding location:', error);
      alert('Failed to add location');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Warehouse className="h-4 w-4" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new storage location for materials. Location name is required.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Location Name *</Label>
            <Input
              id="name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter location name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Location Type</Label>
            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="storage">Storage</SelectItem>
                <SelectItem value="job_site">Job Site</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationDialog;