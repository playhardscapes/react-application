// src/components/emails/EmailList.jsx
import React, { useState, useEffect } from 'react';

const EmailList = ({ folder, onEmailSelect, selectedEmail }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch(`/api/emails?folder=${folder}&page=1&limit=20`);
        const data = await response.json();
        
        // Ensure emails is always an array
        setEmails(Array.isArray(data.emails) ? data.emails : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching emails:', error);
        setEmails([]); // Ensure emails is an empty array on error
        setLoading(false);
      }
    };

    fetchEmails();
  }, [folder]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-4 text-center">Loading emails...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error fetching emails: {error}
      </div>
    );
  }



  return (
    <div>
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
              <h3 className="font-medium truncate">
                {email.sender_name || email.sender_email}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {email.subject}
              </p>
            </div>
            <time className="text-xs text-gray-500">
              {formatDate(email.received_at)}
            </time>
          </div>
        </div>
      ))}
      {emails.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No emails in this folder
        </div>
      )}
    </div>
  );
};

export default EmailList;