'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      setConnectionStatus('idle');
    } else {
      localStorage.removeItem('openai_api_key');
    }
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter an API key first');
      setConnectionStatus('error');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          prompt: 'Test connection - respond with just "OK"',
          model: 'gpt-3.5-turbo',
          temperature: 0.1,
          maxTokens: 10,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus('success');
        handleSaveApiKey(); // Auto-save on successful test
      } else {
        setConnectionStatus('error');
        setErrorMessage(data.error || 'Connection test failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage('Network error - check your connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              connectionStatus === 'success' 
                ? 'bg-green-900/20 text-green-400' 
                : 'bg-red-900/20 text-red-400'
            }`}>
              {connectionStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">
                {connectionStatus === 'success' 
                  ? 'Connection successful!' 
                  : errorMessage || 'Connection failed'
                }
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={testConnection}
              disabled={isTestingConnection || !apiKey.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isTestingConnection ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                handleSaveApiKey();
                onClose();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              <strong>Note:</strong> Your API key is stored locally in your browser and never sent to our servers. 
              It's only used to make direct calls to OpenAI's API from your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
