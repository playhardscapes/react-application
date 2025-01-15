// src/components/proposals/NewProposal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

const FIELD_GROUPS = {
  'Client Information': [
    { key: 'client_name', label: 'Client Name' },
    { key: 'client_email', label: 'Client Email' },
    { key: 'project_location', label: 'Project Location' },
    { key: 'project_type', label: 'Project Type' }
  ],
  'Project Dimensions': [
    { key: 'length', label: 'Length' },
    { key: 'width', label: 'Width' },
    { key: 'square_footage', label: 'Total Area' }
  ],
  'Surface Work': [
    { key: 'needs_pressure_wash', label: 'Pressure Wash Required' },
    { key: 'needs_acid_wash', label: 'Acid Wash Required' },
    { key: 'patch_work_needed', label: 'Patch Work Required' },
    { key: 'patch_work_gallons', label: 'Patch Work Gallons' },
    { key: 'minor_crack_gallons', label: 'Minor Crack Gallons' },
    { key: 'major_crack_gallons', label: 'Major Crack Gallons' }
  ],
  'Surface Systems': [
    { key: 'fiberglass_mesh_needed', label: 'Fiberglass Mesh Required' },
    { key: 'fiberglass_mesh_area', label: 'Fiberglass Mesh Area' },
    { key: 'cushion_system_needed', label: 'Cushion System Required' },
    { key: 'cushion_system_area', label: 'Cushion System Area' }
  ],
  'Court Configuration': [
    { key: 'tennis_courts', label: 'Tennis Courts' },
    { key: 'tennis_court_color', label: 'Tennis Court Color' },
    { key: 'pickleball_courts', label: 'Pickleball Courts' },
    { key: 'pickleball_kitchen_color', label: 'Pickleball Kitchen Color' },
    { key: 'pickleball_court_color', label: 'Pickleball Court Color' },
    { key: 'basketball_courts', label: 'Basketball Courts' },
    { key: 'basketball_court_type', label: 'Basketball Court Type' },
    { key: 'basketball_court_color', label: 'Basketball Court Color' },
    { key: 'apron_color', label: 'Apron Color' }
  ],
  'Equipment': [
    { key: 'permanent_tennis_poles', label: 'Tennis Posts' },
    { key: 'permanent_pickleball_poles', label: 'Pickleball Posts' },
    { key: 'mobile_pickleball_nets', label: 'Mobile Pickleball Nets' },
    { key: 'low_grade_windscreen', label: 'Low Grade Windscreen' },
    { key: 'high_grade_windscreen', label: 'High Grade Windscreen' },
    { key: 'basketball_systems', label: 'Basketball Systems' }
  ],
  'Logistics': [
    { key: 'logistics.travelDays', label: 'Travel Days' },
    { key: 'logistics.numberOfTrips', label: 'Number of Trips' },
    { key: 'logistics.generalLaborHours', label: 'General Labor Hours' },
    { key: 'logistics.hotelRate', label: 'Hotel Rate' },
    { key: 'logistics.distanceToSite', label: 'Distance to Site' },
    { key: 'logistics.logisticalNotes', label: 'Logistical Notes' }
  ]
};

const NewProposal = () => {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [selectedFields, setSelectedFields] = useState({});
  const [aiModel, setAiModel] = useState('claude');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const response = await fetch('/api/estimates');
        if (!response.ok) throw new Error('Failed to fetch estimates');
        const data = await response.json();
        
        console.log('Raw estimates data:', data);
        
        // Ensure we're working with an array
        const estimatesArray = Array.isArray(data) ? data : data.estimates || [];
        console.log('Processed estimates array:', estimatesArray);
        
        setEstimates(estimatesArray);
      } catch (error) {
        console.error('Error fetching estimates:', error);
        setEstimates([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

    // Initialize selected fields when estimate changes
  useEffect(() => {
    if (selectedEstimate) {
      const initialFields = {};
      Object.values(FIELD_GROUPS).flat().forEach(field => {
        initialFields[field.key] = true;
      });
      setSelectedFields(initialFields);
    }
  }, [selectedEstimate]);

  const handleEstimateSelect = async (estimateId) => {
    try {
      const response = await fetch(`/api/estimates/${estimateId}`);
      if (!response.ok) throw new Error('Failed to fetch estimate details');
      const data = await response.json();
      setSelectedEstimate(data);
    } catch (error) {
      console.error('Error fetching estimate details:', error);
    }
  };

  const handleGenerateProposal = async () => {
    setGenerating(true);
    try {
      // Filter the estimate data based on selected fields
      const filteredData = {
        ...selectedEstimate,
        id: selectedEstimate.id
      };

      Object.entries(selectedFields).forEach(([key, selected]) => {
        if (!selected) {
          delete filteredData[key];
        }
      });

      // First, generate the content
      const generateResponse = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimateData: filteredData,
          model: aiModel
        })
      });

      if (!generateResponse.ok) throw new Error('Failed to generate proposal content');
      const { content } = await generateResponse.json();
      
      // Then create the proposal
      const createResponse = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedEstimate.client_id,
          estimate_id: selectedEstimate.id,
          title: `${selectedEstimate.project_type || 'Court'} Construction Proposal - ${selectedEstimate.project_location}`,
          content: content,
          total_amount: selectedEstimate.total_amount,
          status: 'draft'
        })
      });

      if (!createResponse.ok) throw new Error('Failed to create proposal');
      
      const proposal = await createResponse.json();
      // Navigate to the proposal detail page
      navigate(`/proposals/${proposal.id}`);
    } catch (error) {
      console.error('Error generating proposal:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading estimates...</p>
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
            <CardTitle>Create New Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estimate Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Estimate</label>
              <Select
                onValueChange={(value) => handleEstimateSelect(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an estimate..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(estimates) && estimates.length > 0 ? (
                    estimates.map((estimate) => (
                      <SelectItem key={estimate.id} value={estimate.id}>
                        {estimate.project_location || 'No location'} - {estimate.client_name || 'No client'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No estimates available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedEstimate && (
              <>
                {/* Field Selection */}
                <div className="space-y-4">
                  <h3 className="font-medium">Select Information to Include</h3>
                  {Object.entries(FIELD_GROUPS).map(([group, fields]) => (
                    <div key={group} className="border rounded p-4">
                      <h4 className="font-medium mb-2">{group}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {fields.map((field) => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={field.key}
                              checked={selectedFields[field.key] || false}
                              onCheckedChange={(checked) => 
                                setSelectedFields(prev => ({
                                  ...prev,
                                  [field.key]: checked
                                }))
                              }
                            />
                            <label htmlFor={field.key} className="text-sm">
                              {field.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Model Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select AI Model</label>
                  <Select
                    value={aiModel}
                    onValueChange={setAiModel}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude">Claude</SelectItem>
                      <SelectItem value="chatgpt">ChatGPT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/proposals')}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateProposal}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Proposal'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewProposal;