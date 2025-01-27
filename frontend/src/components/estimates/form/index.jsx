import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { usePricing } from '@/hooks/usePricing';
import { PageContainer } from '@/components/layout/PageContainer';
import axios from 'axios';

import ClientInfo from './tabs/ClientInfo';
import ProjectSpecs from './tabs/ProjectSpecs';
import SurfacePrep from './tabs/SurfacePrep';
import CourtDesign from './tabs/CourtDesign';
import Equipment from './tabs/Equipment';
import Logistics from './tabs/Logistics';
import Summary from './tabs/Summary';
import Other from './tabs/Other';

const INITIAL_STATE = {
    client_id: null,
    client_name: '',
    client_email: '',
    client_phone: '',
    project_location: '',
    notes: '',
    length: 0,
    width: 0,
    square_footage: 0,
    needs_pressure_wash: false,
    needs_acid_wash: false,
    patch_work_gallons: 0,
    minor_crack_gallons: 0,
    major_crack_gallons: 0,
    fiberglass_mesh_needed: false,
    fiberglass_mesh_area: null,
    cushion_system_needed: false,
    cushion_system_area: null,
    tennis_courts: 0,
    tennis_court_color: '',
    pickleball_courts: 0,
    pickleball_court_color: '',
    pickleball_kitchen_color: '',
    basketball_courts: 0,
    basketball_court_color: '',
    basketball_lane_color: '',
    basketball_court_type: '',
    basketball_three_point_lines: [],
    apron_color: '',
    tennis_post_sets: 0,
    tennis_posts_installation: false,
    pickleball_post_sets: 0,
    pickleball_posts_installation: false,
    mobile_pickleball_nets: 0,
    basketball_60_count: 0,
    basketball_72_count: 0,
    basketball_fixed_count: 0,
    basketball_installation: false,
    standard_windscreen: 0,
    high_grade_windscreen: 0,
    windscreen_installation: false,
    logistics: {
      travelDays: 2,
      numberOfTrips: 1,
      generalLaborHours: 0,
      hotelRate: 150,
      logisticalNotes: '',
      distanceToSite: 0
    },
    other_items: [],
    margin: 0,
    is_draft: true,
    status: 'new'
  };

const EstimationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const { pricing, loading: pricingLoading } = usePricing();

  const [data, setData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(id ? true : false);
  const [currentTab, setCurrentTab] = useState('client');

  useEffect(() => {
    if (id) {
      const fetchEstimate = async () => {
        try {
          const response = await axios.get(`/api/estimates/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.status === 'completed') {
            toast({
              title: 'Notice',
              description: 'This estimate is completed and cannot be edited.',
              variant: 'default'
            });
            navigate(`/estimates/view/${id}`);
            return;
          }

          setData(response.data);
          setLoading(false);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load estimate',
            variant: 'destructive'
          });
          navigate('/estimates');
        }
      };
      fetchEstimate();
    }
  }, [id, token, navigate, toast]);

  const calculateSurfacePrepCosts = () => {
    const pressureWash = data.needs_pressure_wash ? (data.square_footage * pricing.pressure_wash_per_sqft) : 0;
    const acidWash = data.needs_acid_wash ? (data.square_footage * pricing.acid_wash_per_sqft) : 0;
    const patchWork = {
      total: (data.patch_work_gallons * pricing.patch_work_per_gallon) +
             (data.minor_crack_gallons * pricing.minor_crack_per_gallon) +
             (data.major_crack_gallons * pricing.major_crack_per_gallon)
    };
    const fiberglassMesh = {
      total: data.fiberglass_mesh_needed
        ? ((data.fiberglass_mesh_area * pricing.fiberglass_mesh_per_sqft) +
           (data.fiberglass_mesh_area * pricing.fiberglass_mesh_installation))
        : 0
    };
    const cushionSystem = {
      total: data.cushion_system_needed
        ? ((data.cushion_system_area * pricing.cushion_system_per_sqft) +
           (data.cushion_system_area * pricing.cushion_system_installation))
        : 0
    };
  
    const total = pressureWash + acidWash + patchWork.total + fiberglassMesh.total + cushionSystem.total;
  
    return { pressureWash, acidWash, patchWork, fiberglassMesh, cushionSystem, total };
  };

  const calculateCoatingCosts = () => {
    const uniqueColors = new Set([
      data.tennis_court_color,
      data.pickleball_kitchen_color,
      data.pickleball_court_color,
      data.basketball_court_color,
      data.basketball_lane_color,
      data.apron_color
    ].filter(color => color)).size;
  
    const upchargeRate = pricing[`color_${uniqueColors}_upcharge`] || 0;
    const materials = {
      resurfacer: {
        cost: data.square_footage * pricing.resurfacer_per_sqft,
        installationCost: data.square_footage * pricing.resurfacer_installation
      },
      total: data.square_footage * pricing.color_coat_per_sqft
    };
  
    const installation = {
      baseCost: materials.total,
      upchargeCost: data.square_footage * upchargeRate
    };
  
    const total = materials.total + materials.resurfacer.cost + materials.resurfacer.installationCost + installation.upchargeCost;
  
    return { uniqueColors, upchargeRate, materials, installation, total };
  };

  const calculateEquipmentCosts = () => {
    const tennisPosts = data.tennis_post_sets * pricing.tennis_post_cost;
    const pickleballPosts = data.pickleball_post_sets * pricing.pickleball_post_cost;
    const mobileNets = data.mobile_pickleball_nets * pricing.mobile_net_cost;
  
    const basketballSystems = (data.basketball_60_count * pricing.basketball_60_cost) +
                              (data.basketball_72_count * pricing.basketball_72_cost) +
                              (data.basketball_fixed_count * pricing.basketball_fixed_cost);
  
    const windscreenMaterials = (data.standard_windscreen * pricing.low_grade_windscreen_cost) +
                                (data.high_grade_windscreen * pricing.high_grade_windscreen_cost);
  
    const total = tennisPosts + pickleballPosts + mobileNets + basketballSystems + windscreenMaterials;
  
    return {
      tennis: { total: tennisPosts },
      pickleball: { total: pickleballPosts + mobileNets },
      basketball: { total: basketballSystems },
      windscreen: { total: windscreenMaterials },
      total
    };
  };


const calculateLogisticsCosts = () => {
  const travelDays = data.logistics.travelDays || 0;
  const numberOfTrips = data.logistics.numberOfTrips || 0;
  const distanceToSite = data.logistics.distanceToSite || 0;

  const lodgingNights = Math.max(travelDays - 1, 0) * numberOfTrips;
  const lodgingTotal = lodgingNights * (data.logistics.hotelRate || 150);
  const mileageTotal = distanceToSite * numberOfTrips * 2;

  const total = lodgingTotal + mileageTotal;

  return {
    travelDays,
    numberOfTrips,
    distanceToSite,
    lodgingTotal,
    mileageTotal,
    total
  };
};

const handleSave = async (isDraft) => {
  setLoading(true);
  try {
    const surfacePrepCosts = calculateSurfacePrepCosts();
    const coatingCosts = calculateCoatingCosts();
    const equipmentCosts = calculateEquipmentCosts();
    const logisticsCosts = calculateLogisticsCosts();

    const subtotal = surfacePrepCosts.total + coatingCosts.total + equipmentCosts.total + logisticsCosts.total;
    const marginAmount = subtotal * (data.margin / 100);
    const totalWithMargin = subtotal + marginAmount;

    const saveData = {
      client_id: data.client_id,
      status: isDraft ? 'draft' : 'completed',
      project_location: data.project_location || '',
      project_type: 'court_resurfacing',
      square_footage: data.square_footage || 0,
      length: data.length || 0,
      width: data.width || 0,
      margin_percentage: data.margin || 0,
      total_amount: subtotal,
      total_with_margin: totalWithMargin,
      needs_pressure_wash: data.needs_pressure_wash || false,
      needs_acid_wash: data.needs_acid_wash || false,
      patch_work_gallons: data.patch_work_gallons || 0,
      minor_crack_gallons: data.minor_crack_gallons || 0,
      major_crack_gallons: data.major_crack_gallons || 0,
      fiberglass_mesh_needed: data.fiberglass_mesh_needed || false,
      fiberglass_mesh_area: data.fiberglass_mesh_area || 0,
      cushion_system_needed: data.cushion_system_needed || false,
      cushion_system_area: data.cushion_system_area || 0,
      tennis_courts: data.tennis_courts || 0,
      tennis_court_color: data.tennis_court_color || '',
      pickleball_courts: data.pickleball_courts || 0,
      pickleball_court_color: data.pickleball_court_color || '',
      pickleball_kitchen_color: data.pickleball_kitchen_color || '',
      basketball_courts: data.basketball_courts || 0,
      basketball_court_type: data.basketball_court_type || '',
      basketball_court_color: data.basketball_court_color || '',
      basketball_lane_color: data.basketball_lane_color || '',
      apron_color: data.apron_color || '',
      surface_prep_costs: surfacePrepCosts,
      coating_costs: coatingCosts,
      equipment_costs: equipmentCosts,
      logistics: {
        travelDays: data.logistics.travelDays || 0,
        numberOfTrips: data.logistics.numberOfTrips || 0,
        generalLaborHours: data.logistics.generalLaborHours || 0,
        hotelRate: data.logistics.hotelRate || 0,
        distanceToSite: data.logistics.distanceToSite || 0,
        logisticalNotes: data.logistics.logisticalNotes || '',
        lodgingTotal: logisticsCosts.lodgingTotal || 0,
        mileageTotal: logisticsCosts.mileageTotal || 0,
        total: logisticsCosts.total || 0
      },
      basketball_three_point_lines: data.basketball_three_point_lines || [],
      other_items: data.other_items || []
    };

    console.log('SaveData payload:', saveData);

    await axios.post('/api/estimates', saveData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    toast({
      title: 'Success',
      description: isDraft ? 'Estimate saved as draft' : 'Estimate completed successfully'
    });

    navigate('/estimates');
  } catch (error) {
    console.error('Save error:', error.response?.data || error.message);
    toast({
      title: 'Error',
      description: error.response?.data?.error || 'Failed to save estimate',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};


  const tabs = [
    { value: 'client', label: 'Client Info', component: ClientInfo, props: { data, onChange: setData } },
    { value: 'specs', label: 'Project Specs', component: ProjectSpecs, props: { data, onChange: setData } },
    { value: 'surface', label: 'Surface Prep', component: SurfacePrep, props: { data, onChange: setData, pricing } },
    { value: 'courts', label: 'Court Design', component: CourtDesign, props: { data, onChange: setData } },
    { value: 'equipment', label: 'Equipment', component: Equipment, props: { data, onChange: setData, pricing } },
    { value: 'logistics', label: 'Logistics', component: Logistics, props: { data, onChange: setData } },
    { value: 'other', label: 'Other', component: Other, props: { data, onChange: setData } },
    { value: 'summary', label: 'Summary', component: Summary, props: { data, pricing, onChange: setData } }
  ];

  if (loading || pricingLoading) {
    return (
      <PageContainer>
        <div className="h-32 flex items-center justify-center">
          Loading...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">
            {id ? 'Edit Estimate' : 'New Estimate'}
          </h1>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="p-6">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="flex-1"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-6 pt-2">
            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value}>
                <tab.component {...tab.props} />
                {tab.value === 'summary' && (
                  <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                    <Button variant="outline" onClick={() => navigate('/estimates')}>
                      Cancel
                    </Button>
                   
                    <Button 
                      onClick={() => handleSave(false)} 
                      disabled={loading}
                    >
                      Complete Estimate
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </Card>
    </PageContainer>
  );
};

export default EstimationForm;
