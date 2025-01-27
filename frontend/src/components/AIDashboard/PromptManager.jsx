import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Lock,
  AlertCircle
} from 'lucide-react';

const PromptManager = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePrompt, setActivePrompt] = useState(null);
  const [editedPrompt, setEditedPrompt] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/ai-config/prompts');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      setPrompts(data);
      if (data.length > 0) {
        setActivePrompt(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prompt) => {
    setEditedPrompt(prompt);
  };

  const handleSave = async () => {
    if (!editedPrompt) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/ai-config/prompts/${editedPrompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedPrompt)
      });

      if (!response.ok) throw new Error('Failed to update prompt');
      
      await fetchPrompts();
      setEditedPrompt(null);
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (promptId) => {
    if (!window.confirm('Reset this prompt to default settings?')) return;
    
    try {
      const response = await fetch(`/api/ai-config/prompts/${promptId}/reset`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to reset prompt');
      
      await fetchPrompts();
      setEditedPrompt(null);
    } catch (error) {
      console.error('Error resetting prompt:', error);
    }
  };

  const getCurrentPrompt = () => {
    return editedPrompt || prompts.find(p => p.id === activePrompt);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-center mt-2">Loading prompts...</p>
        </CardContent>
      </Card>
    );
  }

  const currentPrompt = getCurrentPrompt();

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Prompt Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activePrompt} onValueChange={setActivePrompt}>
          <TabsList className="w-full">
            {prompts.map(prompt => (
              <TabsTrigger key={prompt.id} value={prompt.id}>
                <div className="flex items-center gap-2">
                  {prompt.is_locked && <Lock className="h-4 w-4" />}
                  {prompt.name}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {prompts.map(prompt => (
            <TabsContent key={prompt.id} value={prompt.id}>
              {currentPrompt && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{currentPrompt.name}</h3>
                      <p className="text-sm text-gray-600">{currentPrompt.description}</p>
                    </div>

                    {!currentPrompt.is_locked && (
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleReset(currentPrompt.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset to Default
                        </Button>
                        {editedPrompt ? (
                          <Button onClick={handleSave} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        ) : (
                          <Button onClick={() => handleEdit(currentPrompt)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {currentPrompt.is_locked && (
                    <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        This prompt is locked to ensure consistent system behavior. 
                        Contact your administrator if you need to modify it.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Model</label>
                      <Input
                        value={currentPrompt.model}
                        onChange={e => editedPrompt && setEditedPrompt(prev => ({
                          ...prev,
                          model: e.target.value
                        }))}
                        disabled={!editedPrompt || currentPrompt.is_locked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Tokens</label>
                      <Input
                        type="number"
                        value={currentPrompt.max_tokens}
                        onChange={e => editedPrompt && setEditedPrompt(prev => ({
                          ...prev,
                          max_tokens: parseInt(e.target.value)
                        }))}
                        disabled={!editedPrompt || currentPrompt.is_locked}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">System Prompt</label>
                    <Textarea
                      value={currentPrompt.system_prompt}
                      onChange={e => editedPrompt && setEditedPrompt(prev => ({
                        ...prev,
                        system_prompt: e.target.value
                      }))}
                      disabled={!editedPrompt || currentPrompt.is_locked}
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Content Prompt</label>
                    <Textarea
                      value={currentPrompt.content_prompt}
                      onChange={e => editedPrompt && setEditedPrompt(prev => ({
                        ...prev,
                        content_prompt: e.target.value
                      }))}
                      disabled={!editedPrompt || currentPrompt.is_locked}
                      rows={6}
                    />
                  </div>

                  {currentPrompt.required_tables && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Required Tables</label>
                      <div className="space-y-2">
                        {currentPrompt.required_tables.map(table => (
                          <div key={table} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={true}
                              disabled={true}
                              className="h-4 w-4"
                            />
                            <span>{table}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPrompt.seasonal_tips && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800">Seasonal Considerations</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            This prompt supports seasonal adjustments. Consider updating the content
                            based on the current season to improve relevance.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PromptManager;