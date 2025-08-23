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
    <div className={`bg-white border-2 rounded-[24px] shadow-lg min-w-48 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-blue-50 px-3 py-2 border-b border-gray-200 rounded-t-[24px]">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-800">{data.label}</span>
          <Edit3 className="w-3 h-3 text-gray-600 ml-auto" />
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
              className="w-full h-20 px-2 py-1 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </form>
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="min-h-20 p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 cursor-text hover:bg-gray-100 transition-colors"
          >
            {localValue || (
              <span className="text-gray-500 italic">
                {data.placeholder || 'Double-click to edit...'}
              </span>
            )}
          </div>
        )}

        {/* Node Info */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
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
          border: '2px solid #ffffff',
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
}

export default memo(TextInputNode);
