'use client';

import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FileText, Edit3, Type } from 'lucide-react';

interface TextInputNodeData {
  label: string;
  value: string;
  placeholder?: string;
  onDataChange?: (data: any) => void;
}

interface TextInputNodeProps {
  data: TextInputNodeData;
  selected?: boolean;
}

function TextInputNode({ data, selected }: TextInputNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(data.value || '');

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    
    // Update the node data
    if (data.onDataChange) {
      data.onDataChange({ value: localValue });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalValue(data.value || '');
    }
  };

  return (
    <div className={`bg-gray-800 border-2 rounded-lg shadow-lg min-w-48 ${
      selected ? 'border-blue-500' : 'border-blue-600/30'
    }`}>
      {/* Header */}
      <div className="bg-blue-600/20 px-3 py-2 border-b border-blue-600/30 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-100">{data.label}</span>
          <Edit3 className="w-3 h-3 text-blue-300 ml-auto" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <textarea
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setIsEditing(false);
                // Update the node data when losing focus
                if (data.onDataChange) {
                  data.onDataChange({ value: localValue });
                }
              }}
              placeholder={data.placeholder || 'Enter text...'}
              className="w-full h-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </form>
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="min-h-20 p-2 bg-gray-700 border border-gray-600 rounded text-sm text-white cursor-text hover:border-gray-500 transition-colors"
          >
            {localValue || (
              <span className="text-gray-400 italic">
                {data.placeholder || 'Double-click to edit...'}
              </span>
            )}
          </div>
        )}

        {/* Node Info */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Type className="w-3 h-3" />
            <span>Text</span>
          </div>
          <span>{localValue.length} chars</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#3B82F6',
          border: '2px solid #1E40AF',
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
}

export default memo(TextInputNode);
