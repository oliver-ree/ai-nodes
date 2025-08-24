'use client';

import React, { useEffect } from 'react';
import { FileText, Image, Brain, Zap, Video, Monitor, Plus, X } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onNodeCreate: (nodeType: string) => void;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onNodeCreate, onClose }: ContextMenuProps) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.context-menu')) {
        onClose();
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 't': onNodeCreate('textInput'); break;
        case 'i': onNodeCreate('imageInput'); break;
        case 'a': onNodeCreate('aiPrompt'); break;
        case 'g': onNodeCreate('imageGeneration'); break;
        case 'v': onNodeCreate('videoGeneration'); break;
        case 'o': onNodeCreate('output'); break;
        case 'p': onNodeCreate('textProcessor'); break;
        case 'escape': onClose(); break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onNodeCreate, onClose]);

  const menuItems = [
    { 
      type: 'textInput', 
      label: 'Text Input', 
      icon: FileText, 
      color: 'text-blue-400',
      bgColor: 'hover:bg-blue-600/10',
      description: 'Add text content',
      shortcut: 'T'
    },
    { 
      type: 'imageInput', 
      label: 'Image Input', 
      icon: Image, 
      color: 'text-green-400',
      bgColor: 'hover:bg-green-600/10',
      description: 'Upload images',
      shortcut: 'I'
    },
    { 
      type: 'aiPrompt', 
      label: 'AI Prompt', 
      icon: Brain, 
      color: 'text-purple-400',
      bgColor: 'hover:bg-purple-600/10',
      description: 'Generate AI responses',
      shortcut: 'A'
    },
    { 
      type: 'imageGeneration', 
      label: 'Image Generation', 
      icon: Zap, 
      color: 'text-orange-400',
      bgColor: 'hover:bg-orange-600/10',
      description: 'Create images with DALL-E',
      shortcut: 'G'
    },
    { 
      type: 'videoGeneration', 
      label: 'Video Generation', 
      icon: Video, 
      color: 'text-pink-400',
      bgColor: 'hover:bg-pink-600/10',
      description: 'Create videos with Runway ML',
      shortcut: 'V'
    },
    { 
      type: 'textProcessor', 
      label: 'Text Processor', 
      icon: Zap, 
      color: 'text-yellow-400',
      bgColor: 'hover:bg-yellow-600/10',
      description: 'Transform text',
      shortcut: 'P'
    },
    { 
      type: 'output', 
      label: 'Output', 
      icon: Monitor, 
      color: 'text-red-400',
      bgColor: 'hover:bg-red-600/10',
      description: 'Display results',
      shortcut: 'O'
    },
  ];

  return (
    <div
      className="context-menu fixed bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl py-2 z-50 min-w-64"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -10px)',
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plus className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Add Node</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onNodeCreate(item.type)}
              className={`w-full px-3 py-2 text-left flex items-center space-x-3 ${item.bgColor} transition-colors group`}
            >
              <Icon className={`w-4 h-4 ${item.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {item.shortcut}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Press <span className="text-gray-400 font-mono">Esc</span> to close or use keyboard shortcuts
        </p>
      </div>
    </div>
  );
}
