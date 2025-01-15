import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download, Send } from 'lucide-react';

const ProposalPreview = ({ proposal, onSend }) => {
  const [sendingEmail, setSendingEmail] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      await onSend();
    } catch (error) {
      console.error('Error sending proposal:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 print:hidden">
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          variant="outline"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button
          onClick={handleSendEmail}
          disabled={sendingEmail}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {sendingEmail ? 'Sending...' : 'Send to Client'}
        </Button>
      </div>

      {/* Proposal Content */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center border-b">
          <img
            src="/images/logo.png"
            alt="Play Hardscapes"
            className="h-16 mx-auto mb-4"
          />
          <CardTitle className="text-3xl">Project Proposal</CardTitle>
          <p className="text-gray-600">Reference: {proposal.id}</p>
          <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
        </CardHeader>
        
        <CardContent className="space-y-8 p-8">
          {/* Client Information */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Client Name</p>
                <p>{proposal.clientInfo.name}</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p>{proposal.clientInfo.email}</p>
              </div>
              <div>
                <p className="font-medium">Phone</p>
                <p>{proposal.clientInfo.phone}</p>
              </div>
              <div>
                <p className="font-medium">Project Location</p>
                <p>{proposal.clientInfo.address}</p>
              </div>
            </div>
          </section>

          {/* Project Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Project Details</h2>
            <div className="prose max-w-none">
              <h3>Scope of Work</h3>
              <p>{proposal.projectDetails.scope}</p>

              <h3>Timeline</h3>
              <p>{proposal.projectDetails.timeline}</p>

              <h3>Terms & Conditions</h3>
              <p>{proposal.projectDetails.terms}</p>
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Investment</h2>
            <div className="bg-gray-50 p-6 rounded">
              <div className="flex justify-between items-center text-xl">
                <span>Total Project Investment:</span>
                <span className="font-bold">
                  ${proposal.projectDetails.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Next Steps</h2>
            <div className="prose max-w-none">
              <p>To proceed with this project:</p>
              <ol>
                <li>Review the proposal details and included documents</li>
                <li>Sign and return the attached agreement</li>
                <li>Submit your acceptance by replying to this proposal</li>
              </ol>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalPreview;