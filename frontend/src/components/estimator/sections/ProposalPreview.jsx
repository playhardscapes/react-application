import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const ProposalPreview = ({ data, generatedContent }) => {
  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const editorRef = useRef(null);

  const handleSendEmail = async () => {
    // Validate email exists
    if (!data.clientInfo.email) {
      alert('Please provide a valid email address');
      return;
    }

    try {
      setIsSending(true);

      // Get proposal content
      const proposalContent = editedContent ||
        generatedContent ||
        (document.getElementById('proposal-content')
          ? document.getElementById('proposal-content').innerHTML
          : '<p>No proposal content</p>');

      console.log('Sending email with data:', {
        to: data.clientInfo.email,
        subject: `Court Surfacing Proposal for ${data.clientInfo.name}`,
        proposalContentLength: proposalContent.length
      });

      const response = await fetch('http://localhost:5000/api/notifications/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.clientInfo.email,
          subject: `Court Surfacing Proposal for ${data.clientInfo.name}`,
          proposal: proposalContent,
          clientInfo: data.clientInfo
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to send email');
      }

      alert('Proposal sent successfully!');
    } catch (error) {
      console.error('Full email sending error:', error);
      alert(error.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSMS = async () => {
    try {
      setIsSending(true);
      const response = await fetch('http://localhost:5000/api/notifications/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.clientInfo.phone,
          message: `Hi ${data.clientInfo.name}, your court surfacing proposal has been sent to your email. Thank you for considering Play Hardscapes!`
        }),
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      alert('SMS notification sent!');
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Helper function to format date
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to generate project scope section
  const generateProjectScope = () => {
    const parts = [];

    // Surface prep
    if (data.substrate?.type) {
      if (data.substrate.type === 'new-concrete') {
        parts.push("For your new concrete court, we'll begin with a thorough acid wash preparation and primer application to ensure proper coating adhesion.");
      } else {
        parts.push(`Starting with your existing ${data.substrate.type} surface, `);
        if (data.surfaceSystem?.needsPressureWash) {
          parts.push("we'll thoroughly pressure wash the surface to remove any contaminants. ");
        }
      }
    }

    // Surface system details
    if (data.surfaceSystem?.fiberglassMesh?.needed) {
      parts.push("We'll install our professional fiberglass mesh system to prevent crack propagation and ensure long-term surface stability. ");
    }

    // Standard coating process
    parts.push("Our premium coating system includes two coats of acrylic resurfacer followed by two coats of color coating");
    if (data.surfaceSystem?.topCoat?.numberOfColors > 1) {
      parts.push(` in your chosen ${data.surfaceSystem.topCoat.numberOfColors}-color design`);
    }
    parts.push(". ");

    return parts.join('');
  };

  // Helper function to generate court configuration section
  const generateCourtConfig = () => {
    const configs = [];
    const sports = data.courtConfig?.sports;

    if (sports?.tennis?.selected) {
      configs.push(`${sports.tennis.courtCount} tennis court${sports.tennis.courtCount > 1 ? 's' : ''}`);
    }
    if (sports?.pickleball?.selected) {
      configs.push(`${sports.pickleball.courtCount} pickleball court${sports.pickleball.courtCount > 1 ? 's' : ''}`);
    }
    if (sports?.basketball?.selected) {
      configs.push(`${sports.basketball.courtType} basketball court`);
    }

    return configs.join(', ');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Proposal</h1>
            <p className="text-gray-600">{formatDate()}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </button>
            <button
              onClick={handleSendSMS}
              disabled={isSending}
              className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600
                ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSending ? 'Sending...' : 'Send SMS'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isEditing ? (
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={editedContent || generatedContent}
          onEditorChange={(content) => setEditedContent(content)}
          init={{
            height: 500,
            menubar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif; font-size: 14px }'
          }}
        />
      ) : (
        <div id="proposal-content">
          {/* Client Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Prepared For:</h2>
            <p>{data.clientInfo?.name}</p>
            <p>{data.clientInfo?.projectLocation}</p>
          </div>

          {editedContent ? (
            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: editedContent }}
            />
          ) : generatedContent ? (
            <div className="prose max-w-none mb-6">
              {generatedContent}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Project Overview</h2>
                <p className="mb-4">
                  We are pleased to provide this proposal for your {generateCourtConfig()} project.
                  This comprehensive solution is designed to meet your specific requirements and provide
                  a professional-grade playing surface.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Scope of Work</h2>
                <p className="mb-4">{generateProjectScope()}</p>

                {data.surfaceSystem?.topCoat?.colorNotes && (
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <h3 className="font-medium mb-2">Color Specifications:</h3>
                    <p>{data.surfaceSystem.topCoat.colorNotes}</p>
                  </div>
                )}
              </div>

              {/* Project Timeline */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Project Timeline</h2>
                <p>
                  Estimated project duration: {Math.ceil(data.logistics?.estimatedDays * 1.5)} days
                  {data.logistics?.logisticalNotes && ` (${data.logistics.logisticalNotes})`}
                </p>
              </div>

              {/* Notes and Additional Information */}
              {data.clientInfo?.keyNotes && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Additional Notes</h2>
                  <p>{data.clientInfo.keyNotes}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Contact Information */}
      <div className="mt-8 pt-4 border-t">
        <p className="font-medium">Play Hardscapes</p>
        <p>Phone: (540) 384-4854</p>
        <p>Email: patrick@playhardscapes.com</p>
      </div>
    </div>
  );
};

export default ProposalPreview;
