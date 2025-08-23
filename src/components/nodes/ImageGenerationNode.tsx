'use client';

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Settings, Play, Loader2, Image as ImageIcon, Download } from 'lucide-react';

interface ImageGenerationNodeData {
  label: string;
  prompt: string;
  size: string;
  quality: string;
  style: string;
  imageUrl?: string;
  revisedPrompt?: string;
  isGenerating?: boolean;
  nodeId?: string;
  executeWorkflow?: (nodeId: string) => Promise<any>;
  onDataChange?: (data: any) => void;
  activateEdgeFlow?: () => void;
}

interface ImageGenerationNodeProps {
  data: ImageGenerationNodeData;
  selected?: boolean;
}

function ImageGenerationNode({ data, selected }: ImageGenerationNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(data.prompt || '');
  const [size, setSize] = useState(data.size || '1024x1024');
  const [quality, setQuality] = useState(data.quality || 'standard');
  const [style, setStyle] = useState(data.style || 'vivid');
  const [isGenerating, setIsGenerating] = useState(data.isGenerating || false);
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [revisedPrompt, setRevisedPrompt] = useState(data.revisedPrompt || '');

  const handleGenerate = async () => {
    let finalPrompt = localPrompt;
    
    // Get connected input data if available
    if (data.executeWorkflow && data.nodeId) {
      const workflowContext = await data.executeWorkflow(data.nodeId);
      
      if (workflowContext.textContext) {
        // Use connected text as the prompt
        finalPrompt = workflowContext.textContext.replace('Text Input: ', '').trim();
      }
    }
    
    if (!finalPrompt.trim()) {
      alert('Please provide a prompt for image generation');
      return;
    }
    
    setIsGenerating(true);
    setImageUrl('');
    setRevisedPrompt('');
    
    // Activate edge flow animation when starting generation
    if (data.activateEdgeFlow) {
      data.activateEdgeFlow();
    }
    
    try {
      const apiKey = localStorage.getItem('openai_api_key');
      
      if (!apiKey) {
        alert('OpenAI API key not configured. Please go to Settings to add your API key.');
        setIsGenerating(false);
        return;
      }

      const response = await fetch('/api/dalle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          size: size,
          quality: quality,
          style: style,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setImageUrl(responseData.imageUrl);
        setRevisedPrompt(responseData.revisedPrompt || '');
        
        // Update node data
        if (data.onDataChange) {
          data.onDataChange({ 
            imageUrl: responseData.imageUrl,
            revisedPrompt: responseData.revisedPrompt
          });
        }
      } else {
        alert(`Error: ${responseData.error}`);
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      alert('Error: Failed to generate image. Please check your connection and API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    }
  };

  return (
    <div className={`bg-white border-2 rounded-[24px] shadow-lg min-w-80 ${
      selected ? 'border-orange-500' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-yellow-600/20 px-3 py-2 border-b border-yellow-600/30 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-100">{data.label}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-yellow-300 hover:text-white transition-colors"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="text-yellow-300 hover:text-white transition-colors disabled:text-gray-500"
            >
              {isGenerating ? (
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
        {/* Prompt Input */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Image Prompt:</label>
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full h-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-yellow-500"
          />
        </div>

        {/* Connected Inputs Indicator */}
        {data.executeWorkflow && data.nodeId && (
          <div className="text-xs bg-blue-900/20 border border-blue-700/30 rounded p-2">
            <div className="flex items-center space-x-1 text-blue-300">
              <span>🔗</span>
              <span>Will use connected text as prompt</span>
            </div>
          </div>
        )}

        {/* Settings (Expandable) */}
        {isExpanded && (
          <div className="space-y-2 border-t border-gray-700 pt-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Size:</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="1024x1024">Square (1024x1024)</option>
                <option value="1792x1024">Landscape (1792x1024)</option>
                <option value="1024x1792">Portrait (1024x1792)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Quality:</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Style:</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="vivid">Vivid</option>
                  <option value="natural">Natural</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Generated Image */}
        {(imageUrl || isGenerating) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">Generated Image:</label>
              {imageUrl && (
                <button
                  onClick={downloadImage}
                  className="text-xs text-yellow-300 hover:text-white flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              )}
            </div>
            <div className="aspect-square bg-gray-700 border border-gray-600 rounded overflow-hidden">
              {isGenerating ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-yellow-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Generating image...</p>
                    <p className="text-xs text-gray-400">This may take 10-30 seconds</p>
                  </div>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          </div>
        )}

        {/* Revised Prompt */}
        {revisedPrompt && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">DALL-E Revised Prompt:</label>
            <div className="text-xs text-gray-300 bg-gray-700 border border-gray-600 rounded p-2">
              {revisedPrompt}
            </div>
          </div>
        )}

        {/* Node Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-2">
          <div className="flex items-center space-x-1">
            <ImageIcon className="w-3 h-3" />
            <span>DALL-E 3</span>
          </div>
          <div className="flex items-center space-x-2">
            {imageUrl && (
              <span className="flex items-center space-x-1 text-green-400">
                <Zap className="w-3 h-3" />
                <span>Ready</span>
              </span>
            )}
            <span>{size}</span>
          </div>
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#EAB308',
          border: '2px solid #CA8A04',
          width: 12,
          height: 12,
        }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#EAB308',
          border: '2px solid #CA8A04',
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
}

export default memo(ImageGenerationNode);
