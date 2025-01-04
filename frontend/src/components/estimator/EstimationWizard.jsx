// src/components/estimator/EstimationWizard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import ClientSection from './sections/ClientSection';
import ProjectBasics from './sections/ProjectBasics';
import SurfaceSystem from './sections/SurfaceSystem/index';
import CourtConfiguration from './sections/CourtConfiguration/index';
import LogisticsSection from './sections/LogisticsSection/index';
import EquipmentSection from './sections/EquipmentSection/index';
import PricingSection from './sections/PricingSection/index';
import { ProposalGenerator, ProposalPreview } from './components/proposal/index.jsx';

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
  const [currentTab, setCurrentTab] = useState('details');
  const [pricing, setPricing] = useState(null);
  const [proposalContent, setProposalContent] = useState('');

  useEffect(() => {
    // Load pricing data
    const loadPricing = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pricing');
        if (response.ok) {
          const data = await response.json();
          setPricing(data);
        }
      } catch (error) {
        console.error('Failed to load pricing:', error);
      }
    };

    loadPricing();
  }, []);

  const updateSection = (section, data) => {
    setProjectData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const handleProposalGenerated = (content) => {
    setProposalContent(content);
    setCurrentTab('preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold">Play Hardscapes Estimator</h1>
            <p className="text-gray-600">Project Estimate Builder</p>
          </CardHeader>

          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="pricing">Cost Summary</TabsTrigger>
                <TabsTrigger value="generate">Generate Proposal</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  <ClientSection
                    data={projectData.clientInfo}
                    onChange={(data) => updateSection('clientInfo', data)}
                  />
                  <ProjectBasics
                    data={projectData.dimensions}
                    onChange={(data) => updateSection('dimensions', data)}
                  />
                  <SurfaceSystem
                    data={projectData.surfaceSystem}
                    dimensions={projectData.dimensions}
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
                {pricing && (
                  <PricingSection
                    projectData={projectData}
                    pricing={pricing}
                  />
                )}
              </TabsContent>

              <TabsContent value="generate">
                <ProposalGenerator
                  projectData={projectData}
                  onGenerated={handleProposalGenerated}
                />
              </TabsContent>

              <TabsContent value="preview">
                <ProposalPreview
                  content={proposalContent}
                  clientInfo={projectData.clientInfo}
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
