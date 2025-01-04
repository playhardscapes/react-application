// src/components/estimator/sections/PricingSettings/index.jsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { NumberInput } from '@/components/ui/number-input';
import { Button } from '@/components/ui/button';

const PricingSettings = ({ pricing, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updatePrice = (category, subcategory, value) => {
    onUpdate({
      ...pricing,
      [category]: {
        ...pricing[category],
        [subcategory]: value
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing)
      });

      if (response.ok) {
        setMessage('Pricing settings saved successfully');
      } else {
        setMessage('Failed to save pricing settings');
      }
    } catch (error) {
      setMessage('Error saving pricing settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pricing Settings</h2>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Rest of the component remains the same */}
      {/* ... Materials Card */}
      {/* ... Equipment Card */}
      {/* ... Services Card */}
    </div>
  );
};

export default PricingSettings;
