import React, { useState, useEffect } from 'react';
import { defaultPricingConfig } from '../constants/pricing';
import { savePricingConfig, loadPricingConfig } from '../api/pricing';

const PricingConfiguration = ({ pricingData = {}, onChange }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const materials = pricingData.materials || {};
  const equipment = pricingData.equipment || {};
  const services = pricingData.services || {};

  // Load initial pricing data
  useEffect(() => {
    const loadInitialPricing = async () => {
      try {
        const loadedPricing = await loadPricingConfig();
        onChange(loadedPricing);
      } catch (error) {
        console.error('Error loading pricing:', error);
        // Fall back to default pricing if loading fails
        onChange(defaultPricingConfig);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPricing();
  }, [onChange]);

  const handleChange = (category, field, value) => {
    onChange({
      ...pricingData,
      [category]: {
        ...pricingData[category],
        [field]: parseFloat(value) || 0,
      },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePricingConfig(pricingData);
      alert('Pricing saved successfully!');
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert(error.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading pricing configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Global Pricing Configuration</h2>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 bg-blue-500 text-white rounded ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Pricing'}
            </button>
          </div>

          {/* Your existing UI sections remain exactly the same */}
          {/* Materials Section */}
          <div className="bg-gray-100 rounded-lg p-6 shadow">
            <h3 className="text-xl font-medium mb-4">Materials</h3>
            <div className="space-y-4">
              {/* All your existing material inputs remain the same */}
              {/* ... */}
            </div>
          </div>

          {/* Equipment Section */}
          <div className="bg-gray-100 rounded-lg p-6 shadow">
            {/* All your existing equipment inputs remain the same */}
            {/* ... */}
          </div>

          {/* Services Section */}
          <div className="bg-gray-100 rounded-lg p-6 shadow">
            {/* All your existing services inputs remain the same */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingConfiguration;
