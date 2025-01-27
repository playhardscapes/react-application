// src/components/estimator/EstimationForm/tabs/Other/index.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, XIcon } from 'lucide-react';

const OtherCosts = ({ data, onChange }) => {
  const addNewItem = () => {
    const currentItems = Array.isArray(data.other_items) ? data.other_items : [];
    onChange({
      ...data,
      other_items: [...currentItems, { description: '', cost: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...(data.other_items || [])];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...data, other_items: items });
  };

  const removeItem = (index) => {
    const items = (data.other_items || []).filter((_, i) => i !== index);
    onChange({ ...data, other_items: items });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Additional Costs</h3>
          <Button 
            onClick={addNewItem}
            type="button"
            variant="outline"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {(data.other_items || []).map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border rounded">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter item description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost</label>
                  <input
                    type="number"
                    value={item.cost}
                    onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <Button
                onClick={() => removeItem(index)}
                variant="ghost"
                className="text-red-500 hover:text-red-700"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {(!data.other_items || data.other_items.length === 0) && (
            <p className="text-gray-500 text-center py-4">
              No additional costs added yet
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OtherCosts;