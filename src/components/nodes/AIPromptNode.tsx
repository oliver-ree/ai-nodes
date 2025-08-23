'use client';

import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Brain, Settings, Play, Loader2, Zap, Image, FileText, Sparkles } from 'lucide-react';

interface AIPromptNodeData {
  label: string;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  response?: string;
  isProcessing?: boolean;
  nodeId?: string;
  executeWorkflow?: (nodeId: string) => Promise<any>;
  onDataChange?: (data: any) => void;
  activateEdgeFlow?: () => void;
}

interface AIPromptNodeProps {
  data: AIPromptNodeData;
  selected?: boolean;
}

function AIPromptNode({ data, selected }: AIPromptNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(data.prompt || '');
  const [model, setModel] = useState(data.model || 'gpt-4o');
  const [temperature, setTemperature] = useState(data.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(data.maxTokens || 1000);
  const [isProcessing, setIsProcessing] = useState(data.isProcessing || false);
  const [response, setResponse] = useState(data.response || '');
  const [connectedInputs, setConnectedInputs] = useState<any[]>([]);

  // Get connected inputs for visual preview
  useEffect(() => {
    const getConnectedInputs = async () => {
      if (data.executeWorkflow && data.nodeId) {
        try {
          const workflowContext = await data.executeWorkflow(data.nodeId);
          setConnectedInputs(workflowContext.connectedInputs || []);
        } catch (error) {
          console.error('Error getting connected inputs:', error);
        }
      }
    };

    getConnectedInputs();
  }, [data.executeWorkflow, data.nodeId]);

  const handleRun = async () => {
    if (!localPrompt.trim()) return;
    
    setIsProcessing(true);
    setResponse('');
    
    // Activate edge flow animation when starting processing
    if (data.activateEdgeFlow) {
      data.activateEdgeFlow();
    }
    
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        setResponse('Error: OpenAI API key not configured. Please go to Settings to add your API key.');
        setIsProcessing(false);
        return;
      }

      // Get connected input data
      let enhancedPrompt = localPrompt;
      let messages = [];
      let currentModel = model;
      
      if (data.executeWorkflow && data.nodeId) {
        const workflowContext = await data.executeWorkflow(data.nodeId);
        
        if (workflowContext.textContext || workflowContext.imageContext) {
          // Auto-switch to vision model if image is provided
          if (workflowContext.imageContext && !['gpt-4o', 'gpt-4-vision-preview'].includes(model)) {
            currentModel = 'gpt-4o'; // Auto-switch to vision model
            setModel('gpt-4o'); // Update UI
            console.log('Auto-switched to vision model for image processing');
          }
          
          // If we have an image, use vision-capable models
          if (workflowContext.imageContext && (currentModel === 'gpt-4o' || currentModel === 'gpt-4-vision-preview')) {
            console.log('Sending image to vision model:', currentModel);
            console.log('Image URL:', workflowContext.imageContext.substring(0, 50) + '...');
            
            const content = [];
            
            // Add text content
            const textContent = workflowContext.textContext ? 
              `Context: ${workflowContext.textContext}\n\nTask: ${localPrompt}` : 
              localPrompt;
            
            content.push({
              type: 'text',
              text: textContent
            });
            
            // Add image content
            content.push({
              type: 'image_url',
              image_url: {
                url: workflowContext.imageContext,
                detail: 'high'
              }
            });
            
            messages = [
              {
                role: 'user',
                content: content
              }
            ];
          } else {
            // Text-only context (or image with non-vision model)
            if (workflowContext.imageContext && !['gpt-4o', 'gpt-4-vision-preview'].includes(model)) {
              // If we have an image but model doesn't support vision, inform the user
              enhancedPrompt = workflowContext.textContext ? 
                `Context from connected nodes:\n${workflowContext.textContext}\nNote: An image was provided but ${model} doesn't support vision. Please switch to GPT-4o or GPT-4 Vision Preview to analyze images.\n\nTask: ${localPrompt}` : 
                `Note: An image was provided but ${model} doesn't support vision. Please switch to GPT-4o or GPT-4 Vision Preview to analyze images.\n\nTask: ${localPrompt}`;
            } else {
              enhancedPrompt = workflowContext.textContext ? 
                `Context from connected nodes:\n${workflowContext.textContext}\n\nTask: ${localPrompt}` : 
                localPrompt;
            }
          }
        }
      }

      const requestBody = messages.length > 0 ? {
        messages: messages,
        model: currentModel || model,
        temperature: temperature,
        maxTokens: maxTokens,
      } : {
        prompt: enhancedPrompt,
        model: currentModel || model,
        temperature: temperature,
        maxTokens: maxTokens,
      };

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setResponse(responseData.response);
        // Update node data with the response
        if (data.onDataChange) {
          data.onDataChange({ response: responseData.response });
        }
      } else {
        // Handle different types of errors
        if (responseData.type === 'safety_rejection') {
          const suggestionsList = responseData.suggestions 
            ? '\n\nSuggestions:\n' + responseData.suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
            : '';
          
          setResponse(`🚫 Safety System Rejection\n\n${responseData.message}${suggestionsList}\n\n💡 Try:\n• Being more specific about what you want\n• Using neutral, constructive language\n• Avoiding sensitive or controversial topics`);
        } else if (response.status === 400) {
          setResponse(`⚠️ Request Error\n\n${responseData.error}\n\n💡 This might be due to:\n• Invalid prompt format\n• Unsupported model for your request\n• Missing required parameters`);
        } else if (response.status === 401) {
          setResponse(`🔑 Authentication Error\n\n${responseData.error}\n\n💡 Please check your OpenAI API key in Settings.`);
        } else if (response.status === 402) {
          setResponse(`💳 Quota Exceeded\n\n${responseData.error}\n\n💡 Please check your OpenAI billing and usage limits.`);
        } else {
          setResponse(`❌ Error: ${responseData.error || 'Unknown error occurred'}`);
        }
      }
    } catch (error) {
      console.error('API call failed:', error);
      setResponse('🔌 Connection Error\n\nFailed to connect to OpenAI API.\n\n💡 Please check:\n• Your internet connection\n• Your API key is valid\n• OpenAI services are operational');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`bg-white border-2 rounded-[24px] shadow-lg min-w-64 ${
      selected ? 'border-purple-500' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-purple-50 px-3 py-2 border-b border-gray-200 rounded-t-[24px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-800">{data.label}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={handleRun}
              disabled={isProcessing || !localPrompt.trim()}
              className="text-purple-300 hover:text-white transition-colors disabled:text-gray-500"
            >
              {isProcessing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Connected Inputs Visual Preview */}
        {connectedInputs.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-300 mb-2">
              <span>🔗</span>
              <span>Connected Inputs ({connectedInputs.length})</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {connectedInputs.map((input, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {input.type === 'imageInput' && input.data.imageUrl && (
                    <div className="flex items-center space-x-2 bg-gray-600/50 rounded p-2 max-w-48">
                      <div className="relative">
                        <img 
                          src={input.data.imageUrl} 
                          alt="Connected image" 
                          className="w-10 h-10 object-cover rounded border border-gray-500"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Image className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-blue-300 font-medium truncate">
                          {input.data.fileName || input.data.label || 'Image'}
                        </div>
                        <div className="text-xs text-gray-400">Image Input</div>
                      </div>
                    </div>
                  )}
                  
                  {input.type === 'textInput' && input.data.value && (
                    <div className="flex items-center space-x-2 bg-gray-600/50 rounded p-2 max-w-48">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-600/20 border border-green-500/50 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <FileText className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-green-300 font-medium truncate">
                          {input.data.fileName || input.data.label || 'Text'}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {input.data.value.substring(0, 30)}...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {input.type === 'imageGeneration' && input.data.imageUrl && (
                    <div className="flex items-center space-x-2 bg-gray-600/50 rounded p-2 max-w-48">
                      <div className="relative">
                        <img 
                          src={input.data.imageUrl} 
                          alt="Generated image" 
                          className="w-10 h-10 object-cover rounded border border-gray-500"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <Sparkles className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-purple-300 font-medium truncate">
                          Generated Image
                        </div>
                        <div className="text-xs text-gray-400">DALL-E</div>
                      </div>
                    </div>
                  )}
                  
                  {input.type === 'aiPrompt' && input.data.response && (
                    <div className="flex items-center space-x-2 bg-gray-600/50 rounded p-2 max-w-48">
                      <div className="relative">
                        <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/50 rounded flex items-center justify-center">
                          <Brain className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <Brain className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-purple-300 font-medium truncate">
                          AI Response
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {input.data.response.substring(0, 30)}...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Prompt:</label>
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="Enter your AI prompt..."
            className="w-full h-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Settings (Expandable) */}
        {isExpanded && (
          <div className="space-y-2 border-t border-gray-700 pt-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Model:</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="gpt-4o">GPT-4o (Vision + Text)</option>
                <option value="gpt-4-vision-preview">GPT-4 Vision Preview</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Max Tokens:</label>
                <input
                  type="number"
                  min="1"
                  max="4000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Model Status & Warnings */}
        {data.executeWorkflow && data.nodeId && (
          <div className="space-y-2">
            {connectedInputs.length === 0 && (
              <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-center space-x-1 text-gray-600">
                  <span>🔗</span>
                  <span>Connect nodes to include their data automatically</span>
                </div>
              </div>
            )}
            
            {/* Vision Model Warning */}
            {connectedInputs.some(input => (input.type === 'imageInput' && input.data.imageUrl) || (input.type === 'imageGeneration' && input.data.imageUrl)) && 
             !['gpt-4o', 'gpt-4-vision-preview'].includes(model) && (
              <div className="text-xs bg-yellow-900/20 border border-yellow-700/30 rounded p-2">
                <div className="flex items-center space-x-1 text-yellow-300">
                  <span>⚠️</span>
                  <span>Switch to GPT-4o or GPT-4 Vision for image processing</span>
                </div>
              </div>
            )}
            
            {/* Success indicator when vision model is selected with images */}
            {connectedInputs.some(input => (input.type === 'imageInput' && input.data.imageUrl) || (input.type === 'imageGeneration' && input.data.imageUrl)) && 
             ['gpt-4o', 'gpt-4-vision-preview'].includes(model) && (
              <div className="text-xs bg-green-900/20 border border-green-700/30 rounded p-2">
                <div className="flex items-center space-x-1 text-green-300">
                  <span>✅</span>
                  <span>Vision model ready for image analysis</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Response */}
        {(response || isProcessing) && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Response:</label>
            <div className="min-h-16 p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800">
              {isProcessing ? (
                <div className="flex items-center space-x-2 text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating response...</span>
                </div>
              ) : (
                response
              )}
            </div>
          </div>
        )}

        {/* Node Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-2">
          <div className="flex items-center space-x-1">
            <Brain className="w-3 h-3" />
            <span>{model}</span>
          </div>
          <div className="flex items-center space-x-2">
            {response && (
              <span className="flex items-center space-x-1 text-green-400">
                <Zap className="w-3 h-3" />
                <span>Ready</span>
              </span>
            )}
            <span>{localPrompt.length} chars</span>
          </div>
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#8B5CF6',
          border: '2px solid #6D28D9',
          width: 12,
          height: 12,
        }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#8B5CF6',
          border: '2px solid #6D28D9',
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
}

export default memo(AIPromptNode);
