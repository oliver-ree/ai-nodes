'use client';

import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, RefreshCw, Type, Hash } from 'lucide-react';

interface TextProcessorNodeData {
  label: string;
  operation: string;
  customOperation?: string;
  inputText?: string;
  outputText?: string;
}

interface TextProcessorNodeProps {
  data: TextProcessorNodeData;
  selected?: boolean;
}

function TextProcessorNode({ data, selected }: TextProcessorNodeProps) {
  const [operation, setOperation] = useState(data.operation || 'uppercase');
  const [customOperation, setCustomOperation] = useState(data.customOperation || '');
  const [inputText, setInputText] = useState(data.inputText || 'Sample input text for processing...');
  const [outputText, setOutputText] = useState(data.outputText || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const processText = (text: string, op: string) => {
    switch (op) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'title':
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      case 'reverse':
        return text.split('').reverse().join('');
      case 'wordcount':
        return `Word count: ${text.trim().split(/\s+/).length}`;
      case 'charcount':
        return `Character count: ${text.length}`;
      case 'trim':
        return text.trim();
      case 'removeSpaces':
        return text.replace(/\s+/g, '');
      case 'addPrefix':
        return `Processed: ${text}`;
      case 'addSuffix':
        return `${text} - Processed`;
      case 'custom':
        return customOperation ? `${customOperation}: ${text}` : text;
      default:
        return text;
    }
  };

  useEffect(() => {
    if (inputText) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        setOutputText(processText(inputText, operation));
        setIsProcessing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inputText, operation, customOperation]);

  const operationOptions = [
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'title', label: 'Title Case' },
    { value: 'reverse', label: 'Reverse Text' },
    { value: 'wordcount', label: 'Word Count' },
    { value: 'charcount', label: 'Character Count' },
    { value: 'trim', label: 'Trim Whitespace' },
    { value: 'removeSpaces', label: 'Remove Spaces' },
    { value: 'addPrefix', label: 'Add Prefix' },
    { value: 'addSuffix', label: 'Add Suffix' },
    { value: 'custom', label: 'Custom Operation' },
  ];

  return (
    <div className={`bg-gray-800 border-2 rounded-lg shadow-lg min-w-64 ${
      selected ? 'border-yellow-500' : 'border-yellow-600/30'
    }`}>
      {/* Header */}
      <div className="bg-yellow-600/20 px-3 py-2 border-b border-yellow-600/30 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-100">{data.label}</span>
          </div>
          {isProcessing && (
            <RefreshCw className="w-3 h-3 text-yellow-300 animate-spin" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Operation Selection */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Operation:</label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-yellow-500"
          >
            {operationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Operation Input */}
        {operation === 'custom' && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Custom Operation:</label>
            <input
              type="text"
              value={customOperation}
              onChange={(e) => setCustomOperation(e.target.value)}
              placeholder="Enter custom operation..."
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
        )}

        {/* Input Preview */}
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Input:</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white placeholder-gray-400 resize-none focus:outline-none focus:border-yellow-500"
            placeholder="Input text will appear here..."
          />
        </div>

        {/* Output Preview */}
        {outputText && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Output:</label>
            <div className="min-h-16 p-2 bg-gray-700 border border-gray-600 rounded text-xs text-white">
              {isProcessing ? (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                outputText
              )}
            </div>
          </div>
        )}

        {/* Node Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-2">
          <div className="flex items-center space-x-1">
            <Type className="w-3 h-3" />
            <span>{operationOptions.find(op => op.value === operation)?.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            {inputText && (
              <span className="flex items-center space-x-1">
                <Hash className="w-3 h-3" />
                <span>{inputText.length} → {outputText.length}</span>
              </span>
            )}
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

export default memo(TextProcessorNode);
