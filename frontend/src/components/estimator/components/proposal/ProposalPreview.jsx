// src/components/estimator/components/proposal/ProposalPreview.jsx
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Editor } from '@tinymce/tinymce-react';
import { Alert } from '@/components/ui/alert';

export const ProposalPreview = ({ content, clientInfo }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const editorRef = useRef(null);

  const handleSendProposal = async () => {
    setIsSending(true);
    setError(null);
    
    try {
      const finalContent = editorRef.current.getContent();
      
      // Send email
      const emailResponse = await fetch('http://localhost:5000/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: clientInfo.email,
          subject: 'Your Court Surfacing Proposal',
          proposal: finalContent,
          clientInfo
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email');
      }

      // Send SMS notification
      const smsResponse = await fetch('http://localhost:5000/api/notifications/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: clientInfo.phone,
          message: 'Your court surfacing proposal has been sent to your email. Please check your inbox!'
        }),
      });

      if (!smsResponse.ok) {
        console.warn('SMS notification failed but email was sent');
      }

      alert('Proposal has been sent successfully!');
    } catch (error) {
      console.error('Error sending proposal:', error);
      setError('Failed to send proposal: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const finalContent = editorRef.current.getContent();
      
      // Save to backend
      const response = await fetch('http://localhost:5000/api/proposal/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: finalContent,
          clientInfo,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save proposal');
      }

      alert('Proposal saved successfully!');
      
    } catch (error) {
      console.error('Error saving proposal:', error);
      setError('Failed to save proposal: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Proposal Preview</h2>
          <div className="space-x-4">
            <Button 
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              onClick={handleSendProposal}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send to Client'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}
        
        <Editor
  apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
  onInit={(evt, editor) => editorRef.current = editor}
  initialValue={content}
  init={{
    height: 800,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
  }}
  onEditorChange={(content) => setEditedContent(content)}
/>
      </Card>
    </div>
  );
};