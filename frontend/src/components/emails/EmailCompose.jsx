// src/components/emails/EmailCompose.jsx
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EmailCompose = ({ onClose, initialEmail = {} }) => {
  const [email, setEmail] = useState({
    to: initialEmail.sender_email || '',
    subject: initialEmail.subject ? `Re: ${initialEmail.subject}` : '',
    body: initialEmail.body ? 
      `\n\n--- Original Message ---\n${initialEmail.body}` : 
      ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
      });

      if (response.ok) {
        onClose();
      } else {
        // Handle error
        const error = await response.json();
        console.error('Failed to send email:', error);
      }
    } catch (error) {
      console.error('Email send error:', error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {initialEmail.subject ? 'Reply to Email' : 'Compose New Email'}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">To:</label>
          <input
            type="email"
            value={email.to}
            onChange={(e) => setEmail(prev => ({ ...prev, to: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject:</label>
          <input
            type="text"
            value={email.subject}
            onChange={(e) => setEmail(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message:</label>
          <textarea
            value={email.body}
            onChange={(e) => setEmail(prev => ({ ...prev, body: e.target.value }))}
            className="w-full p-2 border rounded h-48"
            required
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmailCompose;