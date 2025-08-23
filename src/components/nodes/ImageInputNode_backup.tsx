'use client';

import React, { memo, useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { Image as ImageIcon, Upload, Link, X } from 'lucide-react';

interface ImageInputNodeData {
  label: string;
  imageUrl: string;
  description?: string;
  onDataChange?: (data: any) => void;
}

interface ImageInputNodeProps {
  data: ImageInputNodeData;
  selected?: boolean;
}

function ImageInputNode({ data, selected }: ImageInputNodeProps) {
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImageUrl = e.target?.result as string;
        setImageUrl(newImageUrl);
        if (data.onDataChange) {
          data.onDataChange({ imageUrl: newImageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImageUrl = event.target?.result as string;
        setImageUrl(newImageUrl);
        if (data.onDataChange) {
          data.onDataChange({ imageUrl: newImageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearImage = () => {
    setImageUrl('');
    if (data.onDataChange) {
      data.onDataChange({ imageUrl: '' });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`bg-white border-2 rounded-[24px] shadow-lg min-w-48 ${
      selected ? 'border-green-500' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="bg-green-50 px-3 py-2 border-b border-gray-200 rounded-t-[24px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-800">{data.label}</span>
          </div>
          {imageUrl && (
            <button
              onClick={clearImage}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {imageUrl ? (
          <div className="space-y-2">
            <div className="relative group">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full h-32 object-cover rounded-xl border border-gray-200"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                >
                  Change
                </button>
              </div>
            </div>
            {data.description && (
              <p className="text-xs text-gray-500">{data.description}</p>
            )}
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
              dragOver 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <ImageIcon className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 mb-2">
              Drag image here or
            </p>
            <div className="space-y-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg flex items-center space-x-1 mx-auto"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-lg flex items-center space-x-1 mx-auto"
              >
                <Link className="w-3 h-3" />
                <span>URL</span>
              </button>
            </div>
          </div>
        )}

        {showUrlInput && (
          <div className="mt-2">
            <input
              type="url"
              placeholder="Paste image URL..."
              value={imageUrl}
              onChange={(e) => {
                const newImageUrl = e.target.value;
                setImageUrl(newImageUrl);
                if (data.onDataChange) {
                  data.onDataChange({ imageUrl: newImageUrl });
                }
              }}
              className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Node Info */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <ImageIcon className="w-3 h-3" />
            <span>Image</span>
          </div>
          {imageUrl && <span className="text-green-600">Ready</span>}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#10B981',
          border: '2px solid #047857',
          width: 12,
          height: 12,
        }}
      />
    </div>
  );
}

export default memo(ImageInputNode);
