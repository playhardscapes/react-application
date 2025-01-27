import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Database, 
  MessageSquare, 
  AlertCircle, 
  Shield,
  Save,
  Trash,
  Plus,
  Settings,
  FileCode
} from 'lucide-react';
import PromptManager from './PromptManager';
import DevelopmentChat from './DevelopmentChat';
import { PageContainer } from '@/components/layout/PageContainer';


const DevelopmentAnalysis = ({ analysis, loading, analyzeSchema }) => {
  const [activeAnalysis, setActiveAnalysis] = useState('schema');
  const [cleanupResults, setCleanupResults] = useState(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  const runCleanupAnalysis = async () => {
    setCleanupLoading(true);
    try {
      const response = await fetch('/api/ai-config/cleanup/analyze');
      if (!response.ok) throw new Error('Failed to analyze code');
      const data = await response.json();
      setCleanupResults(data);
    } catch (error) {
      console.error('Error running cleanup analysis:', error);
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Development Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Analysis Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            className={`p-4 text-left border rounded-lg transition-colors ${
              activeAnalysis === 'schema' 
                ? 'bg-blue-900 text-white border-blue-900' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveAnalysis('schema')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-5 w-5" />
              <span className="font-medium">Database Schema</span>
            </div>
            <p className="text-sm opacity-80">
              Analyze database structure and relationships
            </p>
          </button>

          <button
            className={`p-4 text-left border rounded-lg transition-colors ${
              activeAnalysis === 'cleanup' 
                ? 'bg-blue-900 text-white border-blue-900' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveAnalysis('cleanup')}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileCode className="h-5 w-5" />
              <span className="font-medium">Code Cleanup</span>
            </div>
            <p className="text-sm opacity-80">
              Find duplicate and unused code files
            </p>
          </button>
        </div>

        {/* Analysis Content */}
        <div className="mt-6">
          {activeAnalysis === 'schema' ? (
            <div>
              <Button
                onClick={() => analyzeSchema()}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Brain className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Analyzing Schema...' : 'Analyze Database Schema'}
              </Button>

              {loading ? (
                <div className="text-center py-12">
                  <Brain className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-gray-600">Analyzing database schema...</p>
                </div>
              ) : analysis && (
                <div className="mt-6 space-y-6">
                  {/* Current State */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-4">Current System State</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">Strengths</h4>
                        <ul className="space-y-2">
                          {analysis.currentState.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">Weaknesses</h4>
                        <ul className="space-y-2">
                          {analysis.currentState.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" />
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Development Priorities */}
                  {analysis.developmentPriorities?.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Development Priorities</h3>
                      <div className="space-y-4">
                        {analysis.developmentPriorities.map((priority, index) => (
                          <div key={index} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{priority.feature}</h4>
                              <span className={`px-2 py-1 text-sm rounded ${
                                priority.priority === 'high' 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {priority.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{priority.description}</p>
                            <code className="block bg-gray-50 p-2 rounded text-sm">
                              {priority.technicalDetails}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <Button
                onClick={runCleanupAnalysis}
                disabled={cleanupLoading}
                className="w-full md:w-auto"
              >
                <FileCode className={`h-4 w-4 mr-2 ${cleanupLoading ? 'animate-spin' : ''}`} />
                {cleanupLoading ? 'Analyzing Code...' : 'Run Code Analysis'}
              </Button>

              {cleanupLoading ? (
                <div className="text-center py-12">
                  <FileCode className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-500" />
                  <p className="text-gray-600">Analyzing codebase...</p>
                </div>
              ) : cleanupResults && (
                <div className="mt-6 space-y-6">
                  {/* Duplicate Files */}
                  {cleanupResults.duplicateFiles?.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-800 mb-2">Duplicate Files</h3>
                      <ul className="space-y-2">
                        {cleanupResults.duplicateFiles.map((group, idx) => (
                          <li key={idx} className="text-yellow-700">
                            <p className="font-medium">Similar Files:</p>
                            <ul className="ml-4">
                              {group.files.map((file, fileIdx) => (
                                <li key={fileIdx}>{file.path} ({file.similarity}% similar)</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cleanup Priorities */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Cleanup Priorities</h3>
                    <ul className="space-y-2">
                      {cleanupResults.cleanupPriorities?.map((priority, idx) => (
                        <li key={idx} className="space-y-1">
                          <p className="font-medium text-blue-700">{priority.type}</p>
                          <p className="text-blue-600">{priority.description}</p>
                          <p className="text-sm text-blue-500">
                            Recommendation: {priority.recommendation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Unused Files */}
                  {cleanupResults.unused?.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-4">Unused Files ({cleanupResults.unused.length})</h3>
                      <div className="space-y-4">
                        {cleanupResults.unused.map((file, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{file.path.split('/').pop()}</h4>
                                <p className="text-sm text-gray-600">{file.path}</p>
                                <p className="text-sm text-gray-500 mt-1">Type: {file.type}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                file.type === 'service' ? 'bg-blue-100 text-blue-800' :
                                file.type === 'controller' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {file.type}
                              </span>
                            </div>
                            {file.suggestion && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-100 p-2 rounded">
                                {file.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Coverage */}
                  {cleanupResults.serviceCoverage?.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-800 mb-2">Service Usage Analysis</h3>
                      <div className="space-y-3">
                        {cleanupResults.serviceCoverage.map((service, idx) => (
                          <div key={idx} className="border-b border-yellow-100 last:border-0 pb-2">
                            <div className="font-medium text-yellow-700">{service.name}</div>
                            <div className="text-sm text-yellow-600">
                              Used in {service.usageCount} location{service.usageCount !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-yellow-700 mt-1">
                              {service.usedIn.map((location, i) => (
                                <div key={i}>{location}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AIDashboard = () => {
  const [activeView, setActiveView] = useState('analysis');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(() => {
    const savedAnalysis = localStorage.getItem('schemaAnalysis');
    return savedAnalysis ? JSON.parse(savedAnalysis) : null;
  });

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all analysis data?')) {
      localStorage.removeItem('schemaAnalysis');
      setAnalysis(null);
    }
  };

  const analyzeSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/analyze-schema');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAnalysis(data);
      localStorage.setItem('schemaAnalysis', JSON.stringify(data));
    } catch (error) {
      console.error('Error analyzing schema:', error);
      setAnalysis({
        currentState: {
          strengths: ['Error: ' + error.message],
          weaknesses: ['Could not complete analysis']
        },
        developmentPriorities: [],
        schemaImprovements: [],
        securityConsiderations: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">AI Development Partner</h1>
            <p className="text-gray-600">Database Analysis & Development Suggestions</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="text-sm"
          >
            <Trash className="h-4 w-4 mr-2" />
            Reset All Data
          </Button>
        </div>

        <div className="flex items-center gap-6 border-b mb-6">
          <button 
            className={`flex items-center gap-2 px-2 py-4 border-b-2 transition-colors ${
              activeView === 'analysis' ? 'border-blue-900 text-blue-900' : 'border-transparent'
            }`}
            onClick={() => setActiveView('analysis')}
          >
            <Brain className="h-5 w-5" />
            Development Analysis
          </button>
          <button 
            className={`flex items-center gap-2 px-2 py-4 border-b-2 transition-colors ${
              activeView === 'prompts' ? 'border-blue-900 text-blue-900' : 'border-transparent'
            }`}
            onClick={() => setActiveView('prompts')}
          >
            <Settings className="h-5 w-5" />
            AI Prompts
          </button>
          <button 
            className={`flex items-center gap-2 px-2 py-4 border-b-2 transition-colors ${
              activeView === 'chat' ? 'border-blue-900 text-blue-900' : 'border-transparent'
            }`}
            onClick={() => setActiveView('chat')}
          >
            <MessageSquare className="h-5 w-5" />
            Development Chat
          </button>
        </div>

        {activeView === 'analysis' && (
          <DevelopmentAnalysis 
            analysis={analysis}
            loading={loading}
            analyzeSchema={analyzeSchema}
          />
        )}

        {activeView === 'prompts' && <PromptManager />}

        {activeView === 'chat' && (
          <Card>
            <CardHeader>
              <CardTitle>Development Chat</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chat content */}
              {activeView === 'chat' && (
  <DevelopmentChat analysis={analysis} />
)}
            </CardContent>
          </Card>
        )}
     </PageContainer>
  );
};

export default AIDashboard;