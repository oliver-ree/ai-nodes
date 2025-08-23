'use client';

import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Zap, Download, Copy, Eye, FileText, Image as ImageIcon, Code, RefreshCw, Brain, Sparkles } from 'lucide-react';

interface OutputNodeData {
  label: string;
  value: string;
  format: 'text' | 'json' | 'html' | 'markdown' | 'image';
  nodeId?: string;
  executeWorkflow?: (nodeId: string) => Promise<any>;
  onDataChange?: (data: any) => void;
  activateEdgeFlow?: () => void;
}

interface OutputNodeProps {
  data: OutputNodeData;
  selected?: boolean;
}

function OutputNode({ data, selected }: OutputNodeProps) {
  const [format, setFormat] = useState(data.format || 'text');
  const [value, setValue] = useState(data.value || '');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectedInputs, setConnectedInputs] = useState<any[]>([]);

  // Get connected inputs for visual preview
  const getConnectedInputsPreview = async () => {
    if (data.executeWorkflow && data.nodeId) {
      try {
        const workflowContext = await data.executeWorkflow(data.nodeId);
        setConnectedInputs(workflowContext.connectedInputs || []);
      } catch (error) {
        console.error('Error getting connected inputs:', error);
      }
    }
  };

  // Auto-detect format based on content
  const autoDetectFormat = (content: string) => {
    if (!content) return 'text';
    
    // Check if it's an image URL or data URI
    if (content.startsWith('data:image') || 
        (content.startsWith('http') && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(content))) {
      return 'image';
    }
    
    // Check if it's JSON
    try {
      JSON.parse(content);
      return 'json';
    } catch {}
    
    // Check if it's HTML
    if (content.includes('<') && content.includes('>')) {
      return 'html';
    }
    
    // Check if it's markdown
    if (content.includes('#') || content.includes('*') || content.includes('[')) {
      return 'markdown';
    }
    
    return 'text';
  };

  // Load data from connected inputs
  const loadConnectedData = async () => {
    if (!data.executeWorkflow || !data.nodeId) return;
    
    setIsLoading(true);
    
    // Activate edge flow animation when loading data
    if (data.activateEdgeFlow) {
      data.activateEdgeFlow();
    }
    
    try {
      const workflowContext = await data.executeWorkflow(data.nodeId);
      setConnectedInputs(workflowContext.connectedInputs || []);
      
      let outputContent = '';
      let detectedFormat = 'text';
      
      if (workflowContext.connectedInputs && workflowContext.connectedInputs.length > 0) {
        const input = workflowContext.connectedInputs[0]; // Take first connected input
        
        switch (input.type) {
          case 'textInput':
            outputContent = input.data.value || '';
            detectedFormat = 'text';
            break;
          case 'imageInput':
            outputContent = input.data.imageUrl || '';
            detectedFormat = 'image';
            break;
          case 'aiPrompt':
            outputContent = input.data.response || '';
            detectedFormat = autoDetectFormat(outputContent);
            break;
          case 'textProcessor':
            outputContent = input.data.outputText || input.data.inputText || '';
            detectedFormat = 'text';
            break;
          case 'imageGeneration':
            outputContent = input.data.imageUrl || '';
            detectedFormat = 'image';
            break;
          default:
            outputContent = JSON.stringify(input.data, null, 2);
            detectedFormat = 'json';
        }
        
        setValue(outputContent);
        setFormat(detectedFormat);
        
        // Update node data
        if (data.onDataChange) {
          data.onDataChange({ 
            value: outputContent, 
            format: detectedFormat 
          });
        }
      }
    } catch (error) {
      console.error('Failed to load connected data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load on mount if there are connections
  useEffect(() => {
    if (data.executeWorkflow && data.nodeId) {
      getConnectedInputsPreview();
      if (!value) {
        loadConnectedData();
      }
    }
  }, [data.executeWorkflow, data.nodeId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const mimeTypes = {
      text: 'text/plain',
      json: 'application/json',
      html: 'text/html',
      markdown: 'text/markdown',
      image: 'image/png',
    };

    const extensions = {
      text: 'txt',
      json: 'json',
      html: 'html',
      markdown: 'md',
      image: 'png',
    };

    const blob = new Blob([value], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case 'json':
      case 'html':
        return <Code className="w-3 h-3" />;
      case 'image':
        return <ImageIcon className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const formatOptions = [
    { value: 'text', label: 'Plain Text' },
    { value: 'json', label: 'JSON' },
    { value: 'html', label: 'HTML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'image', label: 'Image' },
  ];

  return (
    <div className={`bg-white border-2 rounded-[24px] shadow-lg min-w-64 ${
      selected ? 'border-red-500' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-red-600/20 px-3 py-2 border-b border-red-600/30 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-100">{data.label}</span>
          </div>
          <div className="flex items-center space-x-1">
            {data.executeWorkflow && data.nodeId && (
              <button
                onClick={loadConnectedData}
                disabled={isLoading}
                className="text-red-300 hover:text-white transition-colors disabled:text-gray-500"
                title="Load data from connected nodes"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {value && (
              <>
                <button
                  onClick={handleCopy}
                  className="text-red-300 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDownload}
                  className="text-red-300 hover:text-white transition-colors"
                  title="Download output"
                >
                  <Download className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Connected Inputs Visual Preview */}
        {connectedInputs.length > 0 && (
          <div className="bg-gray-700/50 border border-gray-600/50 rounded p-3 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-300 mb-2">
              <span>🔗</span>
              <span>Source Data ({connectedInputs.length})</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {connectedInputs.map((input, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {input.type === 'imageInput' && input.data.imageUrl && (
                    <div className="flex items-center space-x-2 bg-gray-600/50 rounded p-2 max-w-48">
                      <div className="relative">
                        <img 
                          src={input.data.imageUrl} 
                          alt="Source image" 
                          className="w-10 h-10 object-cover rounded border border-gray-500"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-2 h-2 text-white" />
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
                        <div className="text-xs text-gray-400">DALL-E Output</div>
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
                          {input.data.label || 'AI Response'}
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

        {/* Format Selection */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Output Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-red-500"
          >
            {formatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Messages */}
        {data.executeWorkflow && data.nodeId && (
          <div className="space-y-2">
            {connectedInputs.length === 0 && (
              <div className="text-xs bg-gray-900/20 border border-gray-700/30 rounded p-2">
                <div className="flex items-center space-x-1 text-gray-400">
                  <span>🔗</span>
                  <span>Connect a node to display its output here</span>
                </div>
              </div>
            )}
            
            {connectedInputs.length > 0 && !value && (
              <div className="text-xs bg-blue-900/20 border border-blue-700/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-blue-300">
                    <span>✨</span>
                    <span>Ready to display connected data</span>
                  </div>
                  <button
                    onClick={loadConnectedData}
                    disabled={isLoading}
                    className="text-blue-300 hover:text-white text-xs underline disabled:text-gray-500"
                  >
                    {isLoading ? 'Loading...' : 'Load'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Output Display */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Output:</label>
          {value ? (
            <div className="space-y-2">
              <div className="min-h-32 max-h-48 p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white overflow-auto">
                {format === 'image' ? (
                  value.startsWith('data:image') || value.startsWith('http') ? (
                    <img src={value} alt="Output" className="max-w-full h-auto rounded" />
                  ) : (
                    <div className="text-gray-400 italic">Invalid image data</div>
                  )
                ) : format === 'json' ? (
                  <pre className="whitespace-pre-wrap text-xs">{
                    (() => {
                      try {
                        return JSON.stringify(JSON.parse(value), null, 2);
                      } catch {
                        return value;
                      }
                    })()
                  }</pre>
                ) : format === 'html' ? (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">Rendered:</div>
                    <div 
                      className="border border-gray-600 rounded p-2 bg-white text-black text-xs"
                      dangerouslySetInnerHTML={{ __html: value }}
                    />
                    <div className="text-xs text-gray-400">Raw HTML:</div>
                    <pre className="text-xs text-gray-300">{value}</pre>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{value}</div>
                )}
              </div>

              {copied && (
                <div className="text-xs text-green-400 text-center">
                  ✓ Copied to clipboard
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-32 p-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-400 italic flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                {data.executeWorkflow && data.nodeId ? (
                  <div>
                    <p>Connect nodes to see output here</p>
                    <p className="text-xs mt-1">Or click refresh to load connected data</p>
                  </div>
                ) : (
                  <p>Output will appear here when workflow runs</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Node Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-2">
          <div className="flex items-center space-x-1">
            {getFormatIcon(format)}
            <span>{formatOptions.find(opt => opt.value === format)?.label}</span>
          </div>
          {value && (
            <div className="flex items-center space-x-2">
              <span className="text-green-400">Ready</span>
              <span>{
                format === 'image' ? 'Image' : 
                `${value.length} chars`
              }</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#EF4444',
          border: '2px solid #DC2626',
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
}

export default memo(OutputNode);
