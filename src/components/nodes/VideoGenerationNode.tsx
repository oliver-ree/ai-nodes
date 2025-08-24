'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { ChevronDown, ChevronRight, Play, Download, Video, Clock } from 'lucide-react';

interface VideoGenerationNodeData {
  nodeId: string;
  label: string;
  prompt?: string;
  model?: string;
  duration?: number;
  ratio?: string;
  resolution?: string;
  isGenerating?: boolean;
  videoUrl?: string;
  taskId?: string;
  progress?: number;
  executeWorkflow?: (nodeId: string) => Promise<{ textContext: string; imageContext: string[] }>;
  onDataChange?: (nodeId: string, data: unknown) => void;
  activateEdgeFlow?: (sourceNodeId: string) => void;
  [key: string]: unknown;
}

interface VideoGenerationNodeProps {
  data: VideoGenerationNodeData;
  selected?: boolean;
}

function VideoGenerationNode({ data, selected }: VideoGenerationNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(data.prompt || '');
  const [model, setModel] = useState(data.model || 'gen3a_turbo');
  const [duration, setDuration] = useState(data.duration || 5);
  const [ratio, setRatio] = useState(data.ratio || '16:9');
  const [resolution, setResolution] = useState(data.resolution || '1280x768');
  const [isGenerating, setIsGenerating] = useState(data.isGenerating || false);
  const [videoUrl, setVideoUrl] = useState(data.videoUrl || '');
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [generationType, setGenerationType] = useState<'image' | 'video'>('video');
  const [taskId, setTaskId] = useState(data.taskId || '');
  const [progress, setProgress] = useState(data.progress || 0);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    let finalPrompt = localPrompt;
    let imagePrompt = '';
    
    // Get connected input data if available
    if (data.executeWorkflow && data.nodeId) {
      const workflowContext = await data.executeWorkflow(data.nodeId);
      
      if (workflowContext.textContext) {
        // Use connected text as the prompt
        finalPrompt = workflowContext.textContext.replace('Text Input: ', '').trim();
      }
      
      if (workflowContext.imageContext && workflowContext.imageContext.length > 0) {
        // Use first connected image for image-to-video
        imagePrompt = workflowContext.imageContext[0];
      }
    }
    
    if (!finalPrompt.trim()) {
      setError('Please provide a prompt for video generation');
      return;
    }
    
    setIsGenerating(true);
    setVideoUrl('');
    setTaskId('');
    setProgress(0);
    setError('');
    
    // Activate edge flow animation when starting processing
    if (data.activateEdgeFlow) {
      data.activateEdgeFlow(data.nodeId);
    }
    
    try {
      const apiKey = localStorage.getItem('runway_api_key');
      
      if (!apiKey) {
        setError('Runway API key not configured. Please go to Settings to add your API key.');
        setIsGenerating(false);
        return;
      }

      const requestBody: any = {
        prompt: finalPrompt,
        model: model,
        duration: duration,
        ratio: ratio,
        resolution: resolution,
      };

      // Add image if connected
      if (imagePrompt) {
        requestBody.image = imagePrompt;
      }

      const response = await fetch('/api/runway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setTaskId(responseData.taskId);
        setProgress(responseData.progress || 0);
        setGenerationType(responseData.generationType || detectedGenerationType);
        
        console.log('🎯 Generation type:', responseData.generationType);
        
        // Start polling for completion
        if (responseData.taskId) {
          pollTaskStatus(responseData.taskId, apiKey, responseData.generationType);
        } else if (responseData.outputUrl) {
          // Handle immediate response
          if (responseData.generationType === 'video') {
            setVideoUrl(responseData.outputUrl);
          } else {
            setImageUrl(responseData.outputUrl);
          }
          setIsGenerating(false);
        }
        
        // Update node data
        if (data.onDataChange) {
          data.onDataChange(data.nodeId, { 
            videoUrl: responseData.videoUrl,
            imageUrl: responseData.imageUrl,
            generationType: responseData.generationType,
            taskId: responseData.taskId,
            progress: responseData.progress
          });
        }
      } else {
        setError(`Error: ${responseData.error}`);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      setError('Error: Failed to generate video. Please check your connection and API key.');
      setIsGenerating(false);
    }
  };

  const pollTaskStatus = async (taskId: string, apiKey: string, genType: 'image' | 'video' = 'video') => {
    const maxPolls = 60; // Poll for up to 10 minutes
    let pollCount = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/runway/status/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        const statusData = await response.json();
        console.log('Status polling response:', statusData);
        
        if (response.ok && statusData) {
          // Handle different possible response structures from Runway ML
          const currentStatus = statusData.status || statusData.state;
          const currentProgress = statusData.progress || 0;
          const videoOutput = statusData.videoUrl || statusData.output || (statusData.outputs && statusData.outputs[0]);
          
          console.log('Status details:', { currentStatus, currentProgress, videoOutput });
          setProgress(currentProgress);
          
          if (currentStatus === 'completed' || currentStatus === 'succeeded' || currentStatus === 'done' || currentStatus === 'SUCCEEDED') {
            if (videoOutput) {
              const outputType = genType || generationType;
              console.log(`🎉 ${outputType.toUpperCase()} generation completed! URL:`, videoOutput);
              console.log('🔄 Updating UI state...');
              
              // Force update all states based on generation type
              if (outputType === 'video') {
                setVideoUrl(videoOutput);
                setImageUrl('');
              } else {
                setImageUrl(videoOutput);
                setVideoUrl('');
              }
              
              setIsGenerating(false);
              setProgress(100);
              setError('');
              
              // Update node data
              if (data.onDataChange) {
                data.onDataChange(data.nodeId, { 
                  videoUrl: outputType === 'video' ? videoOutput : '',
                  imageUrl: outputType === 'image' ? videoOutput : '',
                  generationType: outputType,
                  progress: 100,
                  isGenerating: false
                });
              }
              
              console.log(`✅ UI state updated - ${outputType} should now be visible`);
              return;
            } else {
              console.log('⚠️ Status is SUCCEEDED but no output URL found');
            }
          } else if (currentStatus === 'failed' || currentStatus === 'error') {
            console.log('Video generation failed:', statusData);
            setError(`Video generation failed: ${statusData.error || 'Unknown error'}`);
            setIsGenerating(false);
            return;
          } else if (currentStatus === 'processing' || currentStatus === 'running' || currentStatus === 'pending') {
            console.log('Still processing...', { status: currentStatus, progress: currentProgress });
            // Continue polling
          }
        } else {
          console.log('Status check error:', statusData);
        }
        
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setError('Video generation timed out');
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Status polling error:', error);
        setError('Failed to check generation status');
        setIsGenerating(false);
      }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 5000);
  };

  const downloadMedia = async (url: string, type: 'video' | 'image') => {
    if (!url) return;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      const extension = type === 'video' ? 'mp4' : 'jpg';
      a.download = `runway-${type}-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      setError(`Failed to download ${type}`);
    }
  };

  return (
    <div className={`bg-white border-2 rounded-[24px] shadow-lg min-w-80 
      ${selected ? 'border-orange-400 ring-2 ring-orange-400 ring-opacity-30' : 'border-orange-200 hover:border-orange-300'}
      transition-all duration-200`}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ 
          background: '#f97316',
          width: 12, 
          height: 12,
          border: '2px solid white'
        }}
      />
      
      {/* Header */}
      <div 
        className="bg-orange-50 px-4 py-3 rounded-t-[22px] flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Video className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-800">{data.label}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isGenerating && <Clock className="w-4 h-4 text-orange-500 animate-spin" />}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Prompt
            </label>
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              placeholder="Describe the video you want to generate..."
              className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none h-20 text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg text-gray-800"
            >
              <option value="gen3a_turbo">Gen-3 Alpha Turbo</option>
              <option value="gen3a">Gen-3 Alpha</option>
              <option value="gen2">Gen-2</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Duration (seconds)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg text-gray-800"
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Aspect Ratio
            </label>
            <select
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              className="w-full p-2 text-sm border border-gray-200 rounded-lg text-gray-800"
            >
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
              ${isGenerating 
                ? 'bg-orange-100 text-orange-600 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Generating... {progress}%</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Generate Video</span>
              </div>
            )}
          </button>

          {/* Progress Bar */}
          {isGenerating && progress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* DEBUG: Generation State */}
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div>Debug Info:</div>
            <div>Type: {generationType.toUpperCase()}</div>
            <div>videoUrl: {videoUrl ? 'SET' : 'NOT SET'}</div>
            <div>imageUrl: {imageUrl ? 'SET' : 'NOT SET'}</div>
            <div>isGenerating: {isGenerating ? 'true' : 'false'}</div>
            <div>progress: {progress}%</div>
            {(videoUrl || imageUrl) && <div>URL: {(videoUrl || imageUrl).substring(0, 50)}...</div>}
          </div>

          {/* Generated Content Preview */}
          {generationType === 'video' && videoUrl && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                Generated Video
              </label>
              <video
                src={videoUrl}
                controls
                crossOrigin="anonymous"
                className="w-full rounded-lg border border-gray-200"
                style={{ maxHeight: '200px' }}
                onLoadStart={() => console.log('🎥 Video started loading')}
                onCanPlay={() => console.log('🎥 Video can play')}
                onError={(e) => {
                  console.error('🎥 Video error:', e);
                  console.log('🎥 Trying alternative loading method...');
                }}
              />
              
              {/* Fallback: Direct link if video fails to load */}
              <div className="mt-2">
                <a 
                  href={videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  🔗 Open video in new tab (if player fails)
                </a>
              </div>
              <button
                onClick={() => downloadMedia(videoUrl, 'video')}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Video</span>
              </button>
            </div>
          )}

          {generationType === 'image' && imageUrl && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                Generated Image
              </label>
              <img
                src={imageUrl}
                alt="Generated image"
                className="w-full rounded-lg border border-gray-200"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
                onLoad={() => console.log('🖼️ Image loaded successfully')}
                onError={(e) => console.error('🖼️ Image error:', e)}
              />
              
              {/* Fallback: Direct link if image fails to load */}
              <div className="mt-2">
                <a 
                  href={imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  🔗 Open image in new tab
                </a>
              </div>
              <button
                onClick={() => downloadMedia(imageUrl, 'image')}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>
            </div>
          )}
          
          {/* Fallback: Show if generation should be ready but content isn't showing */}
          {!videoUrl && !imageUrl && !isGenerating && progress === 100 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">⚠️ Generation completed but content not found</p>
            </div>
          )}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ 
          background: '#f97316',
          width: 12, 
          height: 12,
          border: '2px solid white'
        }}
      />
      
      {/* Status Display */}
      <div className="px-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">runway-ml</span>
          {isGenerating ? (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-orange-600">Generating</span>
            </div>
          ) : videoUrl ? (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-600">Ready</span>
            </div>
          ) : (
            <span className="text-gray-500">Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoGenerationNode;
