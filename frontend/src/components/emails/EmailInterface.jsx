import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Inbox, 
  Archive, 
  Trash2, 
  Send,
  Search,
  Plus,
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmailCompose from './EmailCompose';

const EmailInterface = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [folder, setFolder] = useState('inbox');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchEmails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/emails?folder=${folder}&page=${page}&search=${searchTerm}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }

        const data = await response.json();
        setEmails(data.emails || []);
        setTotalPages(Math.ceil(data.total / data.limit));
        setError(null);
      } catch (err) {
        setError(err.message);
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, [token, folder, page, searchTerm, navigate]);


  const folders = [
    { id: 'inbox', icon: Inbox, label: 'Inbox', color: 'text-blue-600' },
    { id: 'sent', icon: Send, label: 'Sent', color: 'text-green-600' },
    { id: 'archived', icon: Archive, label: 'Archive', color: 'text-gray-600' },
    { id: 'trash', icon: Trash2, label: 'Trash', color: 'text-gray-600' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-screen bg-white">
      <div className="grid grid-cols-12 h-full">
        {/* Sidebar */}
        <div className="col-span-2 border-r bg-gray-50">
          <div className="p-4">
            <Dialog open={showCompose} onOpenChange={setShowCompose}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4">
                  <Plus className="h-4 w-4 mr-2" /> Compose
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <EmailCompose onClose={() => setShowCompose(false)} />
              </DialogContent>
            </Dialog>

            <nav className="space-y-1">
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFolder(f.id)}
                  className={`
                    w-full flex items-center space-x-2 px-3 py-2 rounded-lg
                    ${folder === f.id ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'}
                  `}
                >
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                  <span>{f.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Email List */}
        <div className="col-span-3 border-r">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full pl-8 pr-2 py-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-170px)]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="divide-y">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`
                      p-4 cursor-pointer
                      ${selectedEmail?.id === email.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">
                          {email.sender_name || email.sender_email}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {email.subject}
                        </p>
                        <div 
                          className="text-xs text-gray-500 mt-1 truncate h-4"
                          dangerouslySetInnerHTML={{ 
                            __html: email.html_body?.replace(/<[^>]*>/g, '').slice(0, 100) || 
                                   email.body?.slice(0, 100) ||
                                   ''
                          }}
                        />
                      </div>
                      <time className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDate(email.received_at)}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-2 flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Email Content */}
        <div className="col-span-7">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-semibold mb-4">{selectedEmail.subject}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedEmail.sender_name || selectedEmail.sender_email}</div>
                    <div className="text-sm text-gray-600">
                      to {selectedEmail.recipient_email || 'me'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <time className="text-sm text-gray-500">
                      {new Date(selectedEmail.received_at).toLocaleString()}
                    </time>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Reply</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <EmailCompose 
                          onClose={() => setShowCompose(false)} 
                          initialEmail={selectedEmail}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedEmail.html_body || selectedEmail.body || 'No content available'
                  }} 
                />
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select an email to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailInterface;