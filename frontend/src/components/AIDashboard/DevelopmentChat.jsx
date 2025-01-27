// src/components/AIDashboard/DevelopmentChat.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Plus, 
  Save, 
  Database,
  Shield,
  Brain
} from 'lucide-react';

const DevelopmentChat = ({ analysis }) => {
  // Initialize states with localStorage
  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem('aiConversations');
    return savedConversations ? JSON.parse(savedConversations) : { 
      threads: { default: [] }, 
      activeThread: 'default' 
    };
  });
  const [customQuestion, setCustomQuestion] = useState('');

  // Get current conversation thread
  const currentThread = conversations.threads[conversations.activeThread] || [];

  // Helper to save conversations
  const saveConversations = (newConversations) => {
    setConversations(newConversations);
    localStorage.setItem('aiConversations', JSON.stringify(newConversations));
  };

  // Thread management functions
  const createNewThread = () => {
    const threadName = prompt('Enter a name for the new conversation thread:');
    if (threadName) {
      saveConversations({
        ...conversations,
        threads: {
          ...conversations.threads,
          [threadName]: []
        },
        activeThread: threadName
      });
    }
  };

  const switchThread = (threadName) => {
    saveConversations({
      ...conversations,
      activeThread: threadName
    });
  };

  const exportConversation = () => {
    const exportData = {
      threadName: conversations.activeThread,
      timestamp: new Date().toISOString(),
      analysis: analysis,
      conversation: currentThread
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversations.activeThread}-${new Date().toISOString()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Add message to current thread
  const addMessage = (message) => {
    const newMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };
    
    const updatedThread = [...(conversations.threads[conversations.activeThread] || []), newMessage];
    saveConversations({
      ...conversations,
      threads: {
        ...conversations.threads,
        [conversations.activeThread]: updatedThread
      }
    });
  };

  // Handle custom questions
  const handleCustomQuestion = async (e) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      await askQuestion(customQuestion);
      setCustomQuestion('');
    }
  };

  // Ask question with context
  const askQuestion = async (question) => {
    addMessage({ role: 'user', content: question });
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          context: { 
            currentAnalysis: analysis,
            threadName: conversations.activeThread
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addMessage({ 
        role: 'assistant', 
        content: data.response 
      });
    } catch (error) {
      console.error('Error asking question:', error);
      addMessage({ 
        role: 'system', 
        content: `Error: ${error.message}`,
        error: true 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Development Discussion</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={createNewThread} className="text-sm">
              <Plus className="h-4 w-4 mr-1" />
              New Thread
            </Button>
            <Button variant="outline" onClick={exportConversation} className="text-sm">
              <Save className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Thread Selection */}
        <div className="mb-4">
          <select 
            value={conversations.activeThread}
            onChange={(e) => switchThread(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            {Object.keys(conversations.threads).map(threadName => (
              <option key={threadName} value={threadName}>
                {threadName === 'default' ? 'Main Thread' : threadName}
              </option>
            ))}
          </select>
          
          {/* Common Questions */}
          <div className="space-y-2 mb-4">
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => askQuestion("Based on the current schema analysis, what files would I need to share to implement the suggested improvements?")}
            >
              <Database className="h-4 w-4 mr-2" />
              Files needed for improvements
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => askQuestion("What are the security implications of implementing these changes?")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Security implications
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => askQuestion("Can you help me prioritize which improvements to tackle first?")}
            >
              <Brain className="h-4 w-4 mr-2" />
              Prioritization guidance
            </Button>
          </div>

          {/* Custom Question Input */}
          <form onSubmit={handleCustomQuestion} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask a custom question..."
                className="flex-1 p-2 border rounded"
              />
              <Button type="submit" disabled={!customQuestion.trim()}>
                Ask
              </Button>
            </div>
          </form>

          {/* Conversation Display */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {currentThread.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-3/4 p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.error
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm mb-1">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                    {message.timestamp && (
                      <span className="text-xs opacity-75 ml-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: message.content }} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentThread.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start by asking a question above!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DevelopmentChat;