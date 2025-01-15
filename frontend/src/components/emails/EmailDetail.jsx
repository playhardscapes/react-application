// src/components/emails/EmailDetail.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmailDetail = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={onClose}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
      <h2 className="text-2xl font-bold mb-2">{email.subject}</h2>
      <div className="flex items-center space-x-4 mb-4">
        <span className="font-medium">
          {email.sender_name || email.sender_email}
        </span>
        <time className="text-sm text-gray-500">
          {new Date(email.received_at).toLocaleString()}
        </time>
      </div>
      <div 
        className="prose max-w-full"
        dangerouslySetInnerHTML={{ 
          __html: email.html_body || 
                  `<p>${email.body || 'No content'}</p>` 
        }}
      />
      {email.parsed_attachments && email.parsed_attachments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Attachments</h3>
          <div className="space-y-2">
            {email.parsed_attachments.map((attachment, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-2 p-2 border rounded"
              >
                <span>{attachment.filename}</span>
                <span className="text-sm text-gray-500">
                  {(attachment.size / 1024).toFixed(2)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDetail;