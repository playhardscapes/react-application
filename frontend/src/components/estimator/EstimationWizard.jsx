// src/components/estimator/EstimationWizard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import ClientSection from './sections/ClientSection.jsx';
import ProjectBasics from './sections/ProjectBasics.jsx';
import SurfaceSystem from './sections/SurfaceSystem/index.jsx';
import CourtConfiguration from './sections/CourtConfiguration/index.jsx';
import LogisticsSection from './sections/LogisticsSection/index.jsx';
import EquipmentSection from './sections/EquipmentSection/index.jsx';
import PricingSection from './sections/PricingSection/index.jsx';
import PricingSettings from './sections/PricingSettings/index.jsx';
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

const DEFAULT_PRICING = {
  materials: {
    cpb: 150,
    sand: 12,
    cement: 96,
    minorCracks: 45,
    majorCracks: 65,
    acrylicResurfacer: 25,
    colorCoating: 28
  },
  equipment: {
    permanentTennisPoles: 450,
    permanentPickleballPoles: 350,
    mobilePickleballNets: 200,
    lowGradeWindscreen: 3,
    highGradeWindscreen: 5
  },
  services: {
    acidWash: 0.50,
    holeCutting: 150,
    generalLabor: 65,
    windscreenInstallation: 2
  }
};

const EstimationWizard = () => {
  const [projectData, setProjectData] = useState(INITIAL_STATE);
  const [currentTab, setCurrentTab] = useState('details');
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [proposalContent, setProposalContent] = useState('');
  const [showPricingSettings, setShowPricingSettings] = useState(false);

  useEffect(() => {
    const savedPricing = localStorage.getItem('pricing');
    if (savedPricing) {
      setPricing(JSON.parse(savedPricing));
    }
  }, []);

  const handlePricingUpdate = (newPricing) => {
    setPricing(newPricing);
    localStorage.setItem('pricing', JSON.stringify(newPricing));
    setShowPricingSettings(false);
  };

  const updateSection = (section, data) => {
    setProjectData(prev => {
      const newData = {
        ...prev,
        [section]: { ...prev[section], ...data }
      };

      // If we're updating clientInfo with a new distance, update logistics too
      if (section === 'clientInfo' && data.distanceToSite !== undefined) {
        newData.logistics = {
          ...newData.logistics,
          distanceToSite: data.distanceToSite
        };
      }

      return newData;
    });
  };

  const handleProposalGenerated = (content) => {
    setProposalContent(content);
    setCurrentTab('preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Play Hardscapes Estimator</h1>
              <p className="text-gray-600">Project Estimate Builder</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowPricingSettings(!showPricingSettings)}
            >
              Price Settings
            </Button>
          </CardHeader>

          <CardContent>
            {showPricingSettings ? (
              <PricingSettings
                pricing={pricing}
                onUpdate={handlePricingUpdate}
                onCancel={() => setShowPricingSettings(false)}
              />
            ) : (
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="details">Project Details</TabsTrigger>
                  <TabsTrigger value="pricing">Cost Summary</TabsTrigger>
                  <TabsTrigger value="generate">Generate Proposal</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
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
                  <PricingSection
                    projectData={projectData}
                    pricing={pricing}
                  />
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstimationWizard;