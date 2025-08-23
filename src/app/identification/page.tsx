'use client';

import Layout from '@/components/Layout';
import { useState, useCallback } from 'react';
import { 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Calendar,
  Info
} from 'lucide-react';

interface IdentificationResult {
  species: {
    scientificName: string;
    commonName: string;
    kingdom: string;
    family: string;
    conservationStatus: string;
  };
  confidence: number;
  reasoning?: string;
}

export default function IdentificationPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<IdentificationResult[]>([]);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResults([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const identifySpecies = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock results - in real implementation this would call your AI API
    const mockResults: IdentificationResult[] = [
      {
        species: {
          scientificName: 'Panthera leo',
          commonName: 'African Lion',
          kingdom: 'Animalia',
          family: 'Felidae',
          conservationStatus: 'VU'
        },
        confidence: 0.95,
        reasoning: 'Distinctive mane, facial structure, and body proportions consistent with male African lion'
      },
      {
        species: {
          scientificName: 'Panthera tigris',
          commonName: 'Bengal Tiger',
          kingdom: 'Animalia',
          family: 'Felidae',
          conservationStatus: 'EN'
        },
        confidence: 0.12,
        reasoning: 'Similar big cat features but lacks distinctive tiger stripes'
      },
      {
        species: {
          scientificName: 'Panthera pardus',
          commonName: 'Leopard',
          kingdom: 'Animalia',
          family: 'Felidae',
          conservationStatus: 'VU'
        },
        confidence: 0.08,
        reasoning: 'Big cat characteristics but size and mane inconsistent with leopard'
      }
    ];
    
    setResults(mockResults);
    setIsProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LC': return 'bg-green-100 text-green-800';
      case 'NT': return 'bg-yellow-100 text-yellow-800';
      case 'VU': return 'bg-orange-100 text-orange-800';
      case 'EN': return 'bg-red-100 text-red-800';
      case 'CR': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LC': return 'Least Concern';
      case 'NT': return 'Near Threatened';
      case 'VU': return 'Vulnerable';
      case 'EN': return 'Endangered';
      case 'CR': return 'Critically Endangered';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Species Identification</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload an image to identify species using AI-powered recognition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Image</h3>
              
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drop your image here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports JPG, PNG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Camera Option */}
              <div className="mt-4 flex justify-center">
                <button className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium">
                  <Camera className="h-4 w-4" />
                  <span>Take Photo</span>
                </button>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Data</h3>
              <div className="space-y-4">
                <button
                  onClick={getLocation}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Get Current Location</span>
                </button>
                
                {location && (
                  <div className="text-sm text-gray-600">
                    <p>Latitude: {location.lat.toFixed(6)}</p>
                    <p>Longitude: {location.lng.toFixed(6)}</p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  <Info className="h-3 w-3 inline mr-1" />
                  Location data helps improve identification accuracy
                </div>
              </div>
            </div>

            {/* Identify Button */}
            {selectedFile && (
              <button
                onClick={identifySpecies}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    <span>Identify Species</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Preview and Results Section */}
          <div className="space-y-6">
            {/* Image Preview */}
            {previewUrl && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Image Preview</h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>File: {selectedFile?.name}</p>
                  <p>Size: {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB</p>
                  <p>Type: {selectedFile?.type}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Identification Results</h3>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {result.species.commonName}
                          </h4>
                          <p className="text-sm italic text-gray-600">
                            {result.species.scientificName}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                            result.confidence > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(result.confidence * 100)}% confident
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.species.conservationStatus)}`}>
                            {getStatusText(result.species.conservationStatus)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Family:</span> {result.species.family}
                      </div>
                      
                      {result.reasoning && (
                        <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                          <span className="font-medium">AI Reasoning:</span> {result.reasoning}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Save Observation Button */}
                <div className="mt-6">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Save as Observation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Tips for Better Results</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Use high-resolution, clear images</li>
                <li>• Ensure the subject is well-lit and in focus</li>
                <li>• Include distinctive features like face, patterns, or markings</li>
                <li>• Avoid heavy shadows or backlighting</li>
                <li>• Multiple angles can improve accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
