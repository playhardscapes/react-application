// src/components/estimator/EstimationWizard.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { loadPricingConfig } from '@/api/pricing';
import { transformPricingData } from '@/utils/pricingTransform';

// Import section components
import ClientSection from './sections/ClientSection';
import ProjectBasics from './sections/ProjectBasics';
import SurfaceSystem from './sections/SurfaceSystem';
import CourtConfiguration from './sections/CourtConfiguration';
import LogisticsSection from './sections/LogisticsSection';
import EquipmentSection from './sections/EquipmentSection';
import PricingSection from './sections/PricingSection';

// Import validation utility
import { validateEstimateData } from '@/utils/validateEstimateData';
import { estimateService } from '@/services/estimateService';

// Initial state for the estimate
const INITIAL_ESTIMATE_STATE = {
  // Client Details
  client_id: null,
  client_name: '',
  client_email: '',
  client_phone: '',
  status: 'draft',
  total_amount: 0,
  project_location: '',
  project_type: '',
  key_notes: '',
  
  // Dimensions
  length: 0,
  width: 0,
  square_footage: 0,
  
  // Surface System
  needs_pressure_wash: true,
  needs_acid_wash: false,
  patch_work_needed: false,
  patch_work_gallons: 0,
  minor_crack_gallons: 0,
  major_crack_gallons: 0,
  fiberglass_mesh_needed: false,
  fiberglass_mesh_area: 0,
  cushion_system_needed: false,
  cushion_system_area: 0,

  // Court Configuration
  tennis_courts: 0,
  tennis_court_color: '',
  pickleball_courts: 0,
  pickleball_kitchen_color: '',
  pickleball_court_color: '',
  basketball_courts: 0,
  basketball_court_type: '',
  basketball_court_color: '',
  apron_color: '',

  // Equipment
  permanent_tennis_poles: 0,
  permanent_pickleball_poles: 0,
  mobile_pickleball_nets: 0,
  low_grade_windscreen: 0,
  high_grade_windscreen: 0,
  basketball_systems: [],

  // Logistics (stored as JSONB)
  logistics: {
    travelDays: 2,
    numberOfTrips: 1,
    generalLaborHours: 0,
    hotelRate: 150,
    logisticalNotes: '',
    distanceToSite: 0
  }
};

const INITIAL_PRICING_STATE = {
  materials: {},
  equipment: {
    posts: {},
    basketball: {
      systems: {},
      extensions: {}
    },
    windscreen: {},
    installation: {}
  },
  services: {}
};

const EstimationWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(INITIAL_PRICING_STATE);
  const [estimateData, setEstimateData] = useState(INITIAL_ESTIMATE_STATE);
  const [loading, setLoading] = useState(id ? true : false);
  const [errors, setErrors] = useState({});
  const [currentTab, setCurrentTab] = useState('details');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch pricing from API
        const response = await fetch('/api/pricing');
        if (!response.ok) {
          throw new Error('Failed to load pricing configuration');
        }
        const pricingRecords = await response.json();
        
        // Transform the pricing data
        const transformedPricing = transformPricingData(pricingRecords);
        setPricing(transformedPricing);
  
        // If editing existing estimate, fetch its data
        if (id) {
          const existingEstimate = await estimateService.getEstimateById(id);
          
          // Create a structured update
          const estimateUpdate = {
            ...existingEstimate,
            logistics: existingEstimate.logistics || INITIAL_ESTIMATE_STATE.logistics,
            // Client fields populated from the fetched data
            client_id: existingEstimate.client_id || null,
            client_name: existingEstimate.client_name || '',
            client_email: existingEstimate.client_email || '',
            client_phone: existingEstimate.client_phone || '',
            // Set selection flag based on client_id presence
            isClientSelected: !!existingEstimate.client_id,
            // Project details
            project_location: existingEstimate.project_location || '',
            key_notes: existingEstimate.key_notes || ''
          };

          setEstimateData(prevData => ({
            ...prevData,
            ...estimateUpdate
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPricing(INITIAL_PRICING_STATE);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  const handleStateUpdate = (updates) => {
    setEstimateData(prevData => {
      const newData = { ...prevData };
      
      Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && updates[key] !== null) {
          // For nested objects like logistics
          newData[key] = { ...prevData[key], ...updates[key] };
        } else {
          newData[key] = updates[key];
        }
      });

      // Recalculate square footage if dimensions change
      if (updates.length && updates.width) {
        newData.square_footage = (updates.length || prevData.length) * 
                                (updates.width || prevData.width);
      }

      return newData;
    });
  };

  const validateEstimate = () => {
    const validationErrors = validateEstimateData(estimateData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSave = async (isDraft = true) => {
    if (!validateEstimate()) {
      const firstErrorTab = Object.keys(errors)[0] || 'details';
      setCurrentTab(firstErrorTab);
      return;
    }

    setLoading(true);

    try {
      const updatedEstimate = {
        ...estimateData,
        status: isDraft ? 'draft' : 'active'
      };

      const savedEstimate = id 
        ? await estimateService.updateEstimate(id, updatedEstimate)
        : await estimateService.createEstimate(updatedEstimate);

      // Add a brief delay to show save confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));

      navigate('/estimates', { 
        state: { 
          savedNotification: `Estimate ${isDraft ? 'Draft' : ''} Saved Successfully` 
        } 
      });
    } catch (error) {
      console.error('Error saving estimate:', error);
      // Optional: Add error toast or notification
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              Loading estimate...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Play Hardscapes Estimator</h1>
                <p className="text-gray-600">Project Estimate Builder</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
                <h4 className="font-medium text-red-800 mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="list-disc list-inside text-red-700">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}

            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="pricing">Cost Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-6">
                  <ClientSection 
                    data={estimateData}
                    onChange={handleStateUpdate}
                    errors={errors}
                  />
                  <ProjectBasics 
                    data={estimateData}
                    onChange={handleStateUpdate}
                    errors={errors}
                  />
                  <SurfaceSystem 
                    data={estimateData}
                    onChange={handleStateUpdate}
                    errors={errors}
                  />
                  <CourtConfiguration 
                    data={estimateData}
                    onChange={handleStateUpdate}
                    errors={errors}
                  />
                  <LogisticsSection 
                    data={estimateData}
                    onChange={handleStateUpdate}
                    errors={errors}
                  />
                  <EquipmentSection 
                    data={estimateData}
                    onChange={handleStateUpdate}
                    errors={errors}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <PricingSection
                  estimateData={estimateData}
                  pricing={pricing}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/estimates')}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleSave(true)}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={() => handleSave(false)}
                disabled={loading}
                variant="default"
              >
                {loading ? 'Saving...' : 'Save Estimate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstimationWizard;