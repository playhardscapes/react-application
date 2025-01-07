import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VendorDocumentsAccordion } from '../documents';

const ProposalForm = ({ estimateData = null }) => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('details');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [formData, setFormData] = useState({
    clientInfo: {
      name: estimateData?.clientInfo?.name || '',
      email: estimateData?.clientInfo?.email || '',
      phone: estimateData?.clientInfo?.phone || '',
      address: estimateData?.clientInfo?.projectLocation || ''
    },
    projectDetails: {
      scope: '',
      timeline: '',
      terms: '',
      totalAmount: estimateData?.pricing?.total || 0
    },
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement proposal submission
      const proposalData = {
        ...formData,
        supportingDocuments: selectedDocs,
        estimateId: estimateData?.id
      };

      console.log('Submitting proposal:', proposalData);
      
      // Navigate back to proposals list after submission
      navigate('/proposals');
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="details">Project Details</TabsTrigger>
                <TabsTrigger value="documents">Supporting Documents</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="send">Send Proposal</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Client Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.clientInfo.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          clientInfo: { ...formData.clientInfo, name: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.clientInfo.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          clientInfo: { ...formData.clientInfo, email: e.target.value }
                        })}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Project Details</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Scope of Work</label>
                    <textarea
                      value={formData.projectDetails.scope}
                      onChange={(e) => setFormData({
                        ...formData,
                        projectDetails: { ...formData.projectDetails, scope: e.target.value }
                      })}
                      className="w-full p-2 border rounded h-32"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeline</label>
                    <textarea
                      value={formData.projectDetails.timeline}
                      onChange={(e) => setFormData({
                        ...formData,
                        projectDetails: { ...formData.projectDetails, timeline: e.target.value }
                      })}
                      className="w-full p-2 border rounded h-24"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <VendorDocumentsAccordion
                  selectedDocs={selectedDocs}
                  onDocumentsSelect={setSelectedDocs}
                />
              </TabsContent>

              <TabsContent value="preview">
                {/* TODO: Add proposal preview */}
                <div className="bg-gray-50 p-6 rounded">
                  <h3 className="text-lg font-medium mb-4">Preview coming soon...</h3>
                  {/* Add preview content */}
                </div>
              </TabsContent>

              <TabsContent value="send">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Send Proposal</h3>
                    <p className="text-gray-600">
                      Review your proposal details before sending to {formData.clientInfo.name}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/proposals')}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      Send Proposal
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProposalForm;