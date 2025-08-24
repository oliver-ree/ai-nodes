'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Plus, Save, Play, Zap, FileText, Image, Brain, Settings, LogOut, Video } from 'lucide-react';
import SettingsModal from '@/components/Settings';
import PasswordScreen from '@/components/PasswordScreen';

// Dynamically import the WorkflowCanvas to avoid SSR issues
const WorkflowCanvas = dynamic(() => import('@/components/WorkflowCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading Workflow Editor...</div>
    </div>
  )
});

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on page load
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('daisy-auth');
      setIsAuthenticated(authStatus === 'authenticated');
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('daisy-auth');
    setIsAuthenticated(false);
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  // Show password screen if not authenticated
  if (!isAuthenticated) {
    return <PasswordScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Daisy</h1>
            <p className="text-xs text-gray-400">AI Workflow Editor</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center space-x-1"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center space-x-1">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center space-x-1">
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>
          <button 
            onClick={handleLogout}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center space-x-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex flex-1">
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Node Library</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">INPUTS</h3>
              <div className="space-y-2">
                <button 
                  className="w-full p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg text-left hover:bg-blue-600/30 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'textInput');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Text Input</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Add text content</p>
                </button>

                <button 
                  className="w-full p-3 bg-green-600/20 border border-green-600/30 rounded-lg text-left hover:bg-green-600/30 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'imageInput');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Image className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Image Input</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Upload or reference images</p>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">PROCESSING</h3>
              <div className="space-y-2">
                <button 
                  className="w-full p-3 bg-purple-600/20 border border-purple-600/30 rounded-lg text-left hover:bg-purple-600/30 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'aiPrompt');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">AI Prompt</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Generate AI responses</p>
                </button>

                <button 
                  className="w-full p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg text-left hover:bg-yellow-600/30 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'textProcessor');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Text Processor</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Transform text content</p>
                </button>

                <button 
                  className="w-full p-3 bg-orange-600/20 border border-orange-600/30 rounded-lg text-left hover:bg-orange-600/30 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'imageGeneration');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">Image Generation</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Create images with DALL-E</p>
                </button>

                <button 
                  className="w-full p-3 bg-pink-600/20 border border-pink-600/30 rounded-lg text-left hover:bg-pink-600/30 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'videoGeneration');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Video className="w-4 h-4 text-pink-400" />
                    <span className="text-sm">Video Generation</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Create videos with Runway ML</p>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">OUTPUTS</h3>
              <div className="space-y-2">
                <button 
                  className="w-full p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-left hover:bg-red-600/30 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'output');
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="text-sm">Output</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Final workflow result</p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center justify-center space-x-1">
              <Plus className="w-4 h-4" />
              <span>New Workflow</span>
            </button>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 relative">
          <WorkflowCanvas />
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
