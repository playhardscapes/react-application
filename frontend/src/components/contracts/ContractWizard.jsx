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
import { Editor } from '@tinymce/tinymce-react';
import { Loader2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const FIELD_GROUPS = {
  'Client Information': [
    { key: 'client_name', label: 'Client Name' },
    { key: 'client_email', label: 'Client Email' },
    { key: 'project_location', label: 'Project Location' },
  ],
  'Project Details': [
    { key: 'estimate.square_footage', label: 'Project Size' },
    { key: 'estimate.project_type', label: 'Project Type' },
    { key: 'proposal.total_amount', label: 'Contract Amount' },
  ],
  'Timeline': [
    { key: 'start_date', label: 'Start Date' },
    { key: 'completion_date', label: 'Completion Date' },
    { key: 'work_days', label: 'Estimated Work Days' },
  ],
  'Scope of Work': [
    { key: 'proposal.content', label: 'Full Scope' },
    { key: 'materials', label: 'Materials' },
    { key: 'equipment', label: 'Equipment' },
  ],
  'Payment Terms': [
    { key: 'deposit_amount', label: 'Deposit Amount' },
    { key: 'payment_schedule', label: 'Payment Schedule' },
  ]
};

const ContractWizard = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedFields, setSelectedFields] = useState({});
  const [contractContent, setContractContent] = useState('');
  const [contractData, setContractData] = useState({
    startDate: '',
    completionDate: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchAcceptedProposals = async () => {
      try {
        const response = await fetch('/api/proposals?status=approved');
        if (!response.ok) throw new Error('Failed to fetch proposals');
        const data = await response.json();
        setProposals(data);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedProposals();
  }, []);

  const handleProposalSelect = async (proposalId) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);
      if (!response.ok) throw new Error('Failed to fetch proposal details');
      const data = await response.json();
      setSelectedProposal(data);
      
      // Initialize selected fields
      const initialFields = {};
      Object.values(FIELD_GROUPS).flat().forEach(field => {
        initialFields[field.key] = true;
      });
      setSelectedFields(initialFields);
    } catch (error) {
      console.error('Error fetching proposal details:', error);
    }
  };

  const handleDateChange = (field, value) => {
    const fieldMap = {
      start_date: 'startDate',
      completion_date: 'completionDate'
    };

    setContractData(prev => ({
      ...prev,
      [fieldMap[field]]: value
    }));
  };

  const handleGenerateContract = async () => {
    setGenerating(true);
    try {
      console.log('Generating contract with proposal data:', selectedProposal);
      
      const filteredData = {
        ...selectedProposal,
        selectedFields: selectedFields
      };

      const response = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposalData: filteredData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate contract');
      }

      const data = await response.json();
      // Instead of setting content, navigate to the edit page
      navigate(`/contracts/${data.id}/edit`);
    } catch (error) {
      console.error('Error generating contract:', error);
    } finally {
      setGenerating(false);
    }
  };

  const validateDates = () => {
    if (!contractData.startDate || !contractData.completionDate) {
      return false;
    }
    const start = new Date(contractData.startDate);
    const end = new Date(contractData.completionDate);
    return start < end;
  };

  const handleSave = async () => {
    if (!validateDates()) {
      // Show error message about invalid dates
      return;
    }
    try {
      // Format dates for the API
          const formattedData = {
            proposal_id: selectedProposal.id,
            client_id: selectedProposal.client_id,
            contract_amount: selectedProposal.total_amount,
            start_date: contractData.startDate,
            completion_date: contractData.completionDate,
            status: contractData.status
          };

          const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: selectedProposal.id,
          client_id: selectedProposal.client_id,
          title: `Construction Contract - ${selectedProposal.project_location}`,
          content: contractContent,
          contract_amount: selectedProposal.total_amount,
          status: 'draft'
        })
      });

      if (!response.ok) throw new Error('Failed to save contract');
      const contract = await response.json();
      navigate(`/contracts/${contract.id}`);
    } catch (error) {
      console.error('Error saving contract:', error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading accepted proposals...</p>
            </CardContent>
          </Card>
        </PageContainer>
    );
  }

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Create New Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Proposal Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Accepted Proposal
              </label>
              <Select onValueChange={handleProposalSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a proposal..." />
                </SelectTrigger>
                <SelectContent>
                  {proposals.map((proposal) => (
                    <SelectItem key={proposal.id} value={proposal.id}>
                      {proposal.client_name} - {proposal.project_location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProposal && (
              <>
                {/* Field Selection */}
                <div className="space-y-4">
                  <h3 className="font-medium">Contract Information</h3>
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

                {!contractContent ? (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleGenerateContract}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Contract...
                        </>
                      ) : (
                        'Generate Contract'
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Editor
                      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                      value={contractContent}
                      onEditorChange={(content) => setContractContent(content)}
                      init={{
                        height: 500,
                        menubar: true,
                        plugins: [
                          'advlist', 'autolink', 'lists', 'link', 'image', 
                          'charmap', 'preview', 'anchor', 'searchreplace', 
                          'visualblocks', 'code', 'fullscreen',
                          'insertdatetime', 'media', 'table', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                          'bold italic forecolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help'
                      }}
                    />

                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/contracts')}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleGenerateContract}
                        variant="outline"
                        disabled={generating}
                      >
                        Regenerate
                      </Button>
                      <Button onClick={handleSave}>
                        Save Contract
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </PageContainer>
  );
};

export default ContractWizard;