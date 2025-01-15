// src/components/emails/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Inbox, 
  Archive, 
  Trash2, 
  Send, 
  Search, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Email List Component
const EmailList = ({ 
  emails, 
  selectedEmail, 
  onEmailSelect, 
  folder, 
  onFolderChange 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border-r h-full">
      {emails.map(email => (
        <div 
          key={email.id}
          className={`
            p-4 border-b cursor-pointer 
            ${selectedEmail?.id === email.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
          `}
          onClick={() => onEmailSelect(email)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="font-medium truncate">{email.sender_name || email.sender_email}</h3>
              <p className="text-sm text-gray-600 truncate">{email.subject}</p>
            </div>
            <time className="text-xs text-gray-500">
              {formatDate(email.received_at)}
            </time>
          </div>
        </div>
      ))}
    </div>
  );
};

// Email Detail Component
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
        <span className="font-medium">{email.sender_name || email.sender_email}</span>
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

// Main Email Interface
const EmailInterface = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [folder, setFolder] = useState('inbox');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/emails?folder=${folder}&page=${page}&limit=20`);
        const data = await response.json();
        
        setEmails(data.emails);
        setTotalPages(Math.ceil(data.total / data.limit));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching emails:', error);
        setLoading(false);
      }
    };

    fetchEmails();
  }, [folder, page]);

  const folders = [
    { name: 'inbox', icon: Inbox, label: 'Inbox' },
    { name: 'archived', icon: Archive, label: 'Archived' },
    { name: 'sent', icon: Send, label: 'Sent' },
    { name: 'deleted', icon: Trash2, label: 'Trash' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Card className="h-[calc(100vh-100px)] flex">
        {/* Sidebar */}
        <div className="w-64 border-r p-4">
          <Button className="w-full mb-4">Compose</Button>
          {folders.map((f) => (
            <div 
              key={f.name}
              className={`
                flex items-center p-2 rounded cursor-pointer 
                ${folder === f.name 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'hover:bg-gray-100'
                }
              `}
              onClick={() => setFolder(f.name)}
            >
              <f.icon className="mr-2 h-4 w-4" />
              {f.label}
            </div>
          ))}
        </div>

        {/* Email List */}
        <div className="w-1/3 border-r">
          {loading ? (
            <div className="text-center py-6">Loading emails...</div>
          ) : (
            <>
              <EmailList 
                emails={emails}
                selectedEmail={selectedEmail}
                onEmailSelect={setSelectedEmail}
                folder={folder}
              />
              <div className="flex justify-between p-4 border-t">
                <Button 
                  variant="outline" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Email Detail */}
        <div className="w-2/3">
          {selectedEmail ? (
            <EmailDetail 
              email={selectedEmail} 
              onClose={() => setSelectedEmail(null)} 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an email to view
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmailInterface;