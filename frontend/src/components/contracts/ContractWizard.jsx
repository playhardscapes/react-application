// src/components/contracts/ContractWizard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const INITIAL_CONTRACT_STATE = {
  estimateInfo: {
    estimateId: '',
    projectTotal: 0,
    projectScope: ''
  },
  clientInfo: {
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    representative: ''
  },
  projectDetails: {
    startDate: '',
    estimatedDuration: '',
    paymentSchedule: [],
    specialConditions: ''
  },
  terms: {
    warranty: '',
    cancellation: '',
    disputes: ''
  }
};

const ContractWizard = () => {
  const [contractData, setContractData] = useState(INITIAL_CONTRACT_STATE);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [currentTab, setCurrentTab] = useState('estimate');

  // Load estimates for selection
  const loadEstimates = async () => {
    try {
      const response = await fetch('/api/estimates');
      const estimates = await response.json();
      // Handle estimates data
    } catch (error) {
      console.error('Error loading estimates:', error);
    }
  };

  useEffect(() => {
    loadEstimates();
  }, []);

  const updateSection = (section, data) => {
    setContractData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div>
              <h1 className="text-3xl font-bold">Contract Generator</h1>
              <p className="text-gray-600">Create a new contract from estimate</p>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="estimate">Select Estimate</TabsTrigger>
                <TabsTrigger value="client">Client Details</TabsTrigger>
                <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="estimate">
                {/* Estimate selection component */}
              </TabsContent>

              <TabsContent value="client">
                {/* Client information form */}
              </TabsContent>

              <TabsContent value="terms">
                {/* Contract terms and conditions */}
              </TabsContent>

              <TabsContent value="preview">
                {/* Contract preview and generation */}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractWizard;