// src/components/estimator/EstimationWizard.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import ClientSection from './sections/ClientSection';
import ProjectBasics from './sections/ProjectBasics';
import SurfaceSystem from './sections/SurfaceSystem';
import CourtConfiguration from './sections/CourtConfiguration';
import LogisticsSection from './sections/LogisticsSection';
import EquipmentSection from './sections/EquipmentSection';
import PricingSection from './sections/PricingSection';
import SupportingDocuments from './components/SupportingDocuments';
import { ProposalGenerator, ProposalPreview } from './components/proposal';

const INITIAL_STATE = {
  clientInfo: {
    name: '',
    email: '',
    phone: '',
    projectLocation: '',
    distanceToSite: 0,
    keyNotes: ''
  },
  dimensions: {
    length: 0,
    width: 0,
    squareFootage: 0
  },
  substrate: {
    type: '',
    notes: ''
  },
  surfaceSystem: {
    needsPressureWash: true,
    needsAcidWash: false,
    patchWork: {
      needed: false,
      estimatedGallons: 0,
      minorCrackGallons: 0,
      majorCrackGallons: 0
    },
    fiberglassMesh: {
      needed: false,
      area: 0
    },
    cushionSystem: {
      needed: false,
      area: 0
    },
    topCoat: {
      numberOfColors: 1,
      colorNotes: ''
    }
  },
  courtConfig: {
    sports: {},
    apron: {
      color: ''
    }
  },
  equipment: {
    permanentTennisPoles: 0,
    permanentPickleballPoles: 0,
    mobilePickleballNets: 0,
    lowGradeWindscreen: 0,
    highGradeWindscreen: 0,
    basketballSystems: []
  },
  logistics: {
    travelDays: 2,
    numberOfTrips: 1,
    generalLaborHours: 0,
    hotelRate: 150,
    logisticalNotes: ''
  }
};

const EstimationWizard = () => {
  const [projectData, setProjectData] = useState(INITIAL_STATE);
  const [globalPricing, setGlobalPricing] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [currentTab, setCurrentTab] = useState('details');

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/load-pricing');
        if (response.ok) {
          const prices = await response.json();
          setGlobalPricing(prices);
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
      }
    };
    loadPricing();
  }, []);

  const handleProposalGenerated = (content) => {
    setGeneratedContent(content);
    setCurrentTab('preview');
  };

  const handleProposalSent = () => {
    // Handle success, maybe reset form or show confirmation
  };

  const updateSection = (section, data) => {
    setProjectData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Play Hardscapes Estimator</h1>
              <p className="text-gray-600">Project Estimate Builder</p>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="pricing">Cost Summary</TabsTrigger>
                <TabsTrigger value="generate">Generate Proposal</TabsTrigger>
                <TabsTrigger value="preview">Proposal Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-8">
                  <ClientSection
                    data={projectData.clientInfo}
                    onChange={(data) => updateSection('clientInfo', data)}
                  />
                  <ProjectBasics
                    data={projectData.substrate}
                    onChange={(data) => updateSection('substrate', data)}
                  />
                  <SurfaceSystem
                    data={projectData.surfaceSystem}
                    onChange={(data) => updateSection('surfaceSystem', data)}
                  />
                  <CourtConfiguration
                    data={projectData.courtConfig}
                    onChange={(data) => updateSection('courtConfig', data)}
                  />
                  <LogisticsSection
                    data={projectData.logistics}
                    onChange={(data) => updateSection('logistics', data)}
                  />
                  <EquipmentSection
                    data={projectData.equipment}
                    onChange={(data) => updateSection('equipment', data)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing">
                <PricingSection
                  projectData={projectData}
                  globalPricing={globalPricing}
                />
              </TabsContent>

              <TabsContent value="generate">
                <div className="p-6">
                  <SupportingDocuments
                    selectedDocs={selectedDocs}
                    onDocSelect={(docUrl, isSelected) => {
                      if (isSelected) {
                        setSelectedDocs([...selectedDocs, docUrl]);
                      } else {
                        setSelectedDocs(selectedDocs.filter(url => url !== docUrl));
                      }
                    }}
                  />
                  <ProposalGenerator
                    projectData={projectData}
                    supportingDocs={selectedDocs}
                    onGenerated={handleProposalGenerated}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <ProposalPreview
                  content={generatedContent}
                  clientInfo={projectData.clientInfo}
                  onSend={handleProposalSent}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstimationWizard;
