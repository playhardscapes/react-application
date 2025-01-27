import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Archive } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/utils/formatting';

const InfoSection = ({ title, children }) => (
  <div className="space-y-4 pb-6 border-b">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-600">{label}</label>
    <p className="font-medium">{value || 'N/A'}</p>
  </div>
);

const CostSection = ({ title, items, total }) => (
  <div className="space-y-2">
    <h3 className="font-medium text-gray-800">{title}</h3>
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-gray-600">{item.label}</span>
          <span>{formatCurrency(item.amount)}</span>
        </div>
      ))}
      <div className="flex justify-between font-medium pt-1 border-t">
        <span>Total {title}</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  </div>
);

const EstimateView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const response = await fetch(`/api/estimates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch estimate');
        
        const data = await response.json();
        setEstimate(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load estimate details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [id, token, toast]);

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="text-center py-8">
        <p>Estimate not found</p>
        <Button variant="link" onClick={() => navigate('/estimates')}>
          Back to Estimates
        </Button>
      </div>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Estimate #{estimate.id}</CardTitle>
            <p className="text-sm text-gray-500">
              Created on {new Date(estimate.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/estimates')}>
              Back to Estimates
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/proposals/new/${estimate.id}`)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Proposal
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Client Information */}
        <InfoSection title="Client Information">
          <Field label="Name" value={estimate.client_name} />
          <Field label="Email" value={estimate.client_email} />
          <Field label="Phone" value={estimate.client_phone} />
          <Field label="Project Location" value={estimate.project_location} />
        </InfoSection>

        {/* Project Specifications */}
        <InfoSection title="Project Specifications">
          <Field label="Length" value={`${estimate.length} ft`} />
          <Field label="Width" value={`${estimate.width} ft`} />
          <Field label="Total Area" value={`${estimate.square_footage} sq ft`} />
          <Field label="Project Type" value={estimate.project_type} />
        </InfoSection>

        {/* Surface Preparation */}
        <InfoSection title="Surface Preparation">
          <Field label="Pressure Wash" value={estimate.needs_pressure_wash ? 'Yes' : 'No'} />
          <Field label="Acid Wash" value={estimate.needs_acid_wash ? 'Yes' : 'No'} />
          <Field label="Patch Work" value={`${estimate.patch_work_gallons || 0} gallons`} />
          <Field label="Minor Cracks" value={`${estimate.minor_crack_gallons || 0} gallons`} />
          <Field label="Major Cracks" value={`${estimate.major_crack_gallons || 0} gallons`} />
          {estimate.fiberglass_mesh_needed && (
            <Field label="Fiberglass Mesh" value={`${estimate.fiberglass_mesh_area} sq ft`} />
          )}
          {estimate.cushion_system_needed && (
            <Field label="Cushion System" value={`${estimate.cushion_system_area} sq ft`} />
          )}
        </InfoSection>

        {/* Court Configuration */}
        {(estimate.tennis_courts > 0 || estimate.pickleball_courts > 0 || estimate.basketball_courts > 0) && (
          <InfoSection title="Court Configuration">
            {estimate.tennis_courts > 0 && (
              <>
                <Field label="Tennis Courts" value={estimate.tennis_courts} />
                <Field label="Tennis Court Color" value={estimate.tennis_court_color} />
              </>
            )}
            {estimate.pickleball_courts > 0 && (
              <>
                <Field label="Pickleball Courts" value={estimate.pickleball_courts} />
                <Field label="Court Color" value={estimate.pickleball_court_color} />
                <Field label="Kitchen Color" value={estimate.pickleball_kitchen_color} />
              </>
            )}
            {estimate.basketball_courts > 0 && (
              <>
                <Field label="Basketball Courts" value={estimate.basketball_courts} />
                <Field label="Court Type" value={estimate.basketball_court_type} />
                <Field label="Court Color" value={estimate.basketball_court_color} />
                <Field label="Lane Color" value={estimate.basketball_lane_color} />
              </>
            )}
            <Field label="Apron Color" value={estimate.apron_color} />
          </InfoSection>
        )}

        {/* Equipment */}
        <InfoSection title="Equipment">
          {estimate.permanent_tennis_poles > 0 && (
            <Field label="Tennis Net Posts" value={`${estimate.permanent_tennis_poles} sets`} />
          )}
          {estimate.permanent_pickleball_poles > 0 && (
            <Field label="Pickleball Net Posts" value={`${estimate.permanent_pickleball_poles} sets`} />
          )}
          {estimate.mobile_pickleball_nets > 0 && (
            <Field label="Mobile Pickleball Nets" value={estimate.mobile_pickleball_nets} />
          )}
          {estimate.low_grade_windscreen > 0 && (
            <Field label="Standard Windscreen" value={`${estimate.low_grade_windscreen} linear ft`} />
          )}
          {estimate.high_grade_windscreen > 0 && (
            <Field label="High-Grade Windscreen" value={`${estimate.high_grade_windscreen} linear ft`} />
          )}
        </InfoSection>

        {/* Logistics */}
        <InfoSection title="Logistics">
          <Field label="Travel Days" value={estimate.logistics.travelDays} />
          <Field label="Number of Trips" value={estimate.logistics.numberOfTrips} />
          <Field label="Labor Hours" value={estimate.logistics.generalLaborHours} />
          <Field label="Hotel Rate" value={formatCurrency(estimate.logistics.hotelRate)} />
          <Field label="Distance to Site" value={`${estimate.logistics.distanceToSite} miles`} />
        </InfoSection>

        {/* Financial Summary */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Financial Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {estimate.surface_prep_costs && (
              <CostSection 
                title="Surface Preparation" 
                items={[
                  { label: "Pressure Washing", amount: estimate.surface_prep_costs.pressure_wash },
                  { label: "Acid Wash", amount: estimate.surface_prep_costs.acid_wash },
                  { label: "Patch Work", amount: estimate.surface_prep_costs.patch_work.total },
                  { label: "Fiberglass Mesh", amount: estimate.surface_prep_costs.fiberglass_mesh.total },
                  { label: "Cushion System", amount: estimate.surface_prep_costs.cushion_system.total }
                ]}
                total={estimate.surface_prep_costs.total}
              />
            )}
            
            {estimate.coating_costs && (
              <CostSection 
                title="Coating" 
                items={[
                  { label: "Materials", amount: estimate.coating_costs.materials.total },
                  { label: "Installation", amount: estimate.coating_costs.installation.total },
                  { label: "Line Marking", amount: estimate.coating_costs.lining.total }
                ]}
                total={estimate.coating_costs.total}
              />
            )}
            
            {estimate.equipment_costs && (
              <CostSection 
                title="Equipment" 
                items={[
                  { label: "Tennis Equipment", amount: estimate.equipment_costs.tennis.total },
                  { label: "Pickleball Equipment", amount: estimate.equipment_costs.pickleball.total },
                  { label: "Basketball Systems", amount: estimate.equipment_costs.basketball.total },
                  { label: "Windscreen", amount: estimate.equipment_costs.windscreen.total }
                ]}
                total={estimate.equipment_costs.total}
              />
            )}
            
            {estimate.logistics_costs && (
              <CostSection 
                title="Labor and Travel" 
                items={[
                  { label: "Labor", amount: estimate.logistics_costs.labor.total },
                  { label: "Lodging", amount: estimate.logistics_costs.lodging.total },
                  { label: "Mileage", amount: estimate.logistics_costs.mileage.total }
                ]}
                total={estimate.logistics_costs.total}
              />
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(estimate.total_amount)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Margin ({estimate.margin_percentage}%):</span>
              <span>{formatCurrency(estimate.total_with_margin - estimate.total_amount)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(estimate.total_with_margin)}</span>
            </div>
            <div className="text-sm text-gray-600 text-right">
              {formatCurrency(estimate.total_with_margin / estimate.square_footage)} per sq ft
            </div>
          </div>

          {/* Other Costs */}
          {estimate.other_items?.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-medium">Additional Costs</h3>
              {estimate.other_items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.description}</span>
                  <span>{formatCurrency(item.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        {estimate.logistics?.logisticalNotes && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {estimate.logistics.logisticalNotes}
            </p>
          </div>
        )}

        {/* Status */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                estimate.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                estimate.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
              </span>
            </div>
            
            {estimate.status !== 'archived' && (
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/estimates/${estimate.id}/archive`, {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });

                    if (!response.ok) throw new Error('Failed to archive estimate');

                    toast({
                      title: 'Success',
                      description: 'Estimate archived successfully'
                    });

                    // Refresh the estimate data
                    const updatedEstimate = await response.json();
                    setEstimate(updatedEstimate);
                  } catch (error) {
                    toast({
                      title: 'Error',
                      description: 'Failed to archive estimate',
                      variant: 'destructive'
                    });
                  }
                }}
              >
                <Archive className="h-4 h-4" />
                Archive
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateView;