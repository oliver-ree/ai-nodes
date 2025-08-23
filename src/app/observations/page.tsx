'use client';

import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  MapPin, 
  Calendar, 
  Eye,
  Camera,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Layers
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
});

interface Observation {
  id: string;
  species: {
    scientificName: string;
    commonName: string;
    conservationStatus: string;
  };
  observer: {
    name: string;
    role: string;
  };
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  timestamp: string;
  confidence: number;
  verified: boolean;
  imageUrl?: string;
  notes?: string;
}

// Mock data for demonstration
const mockObservations: Observation[] = [
  {
    id: '1',
    species: {
      scientificName: 'Panthera leo',
      commonName: 'African Lion',
      conservationStatus: 'VU'
    },
    observer: {
      name: 'Dr. Sarah Johnson',
      role: 'Senior Researcher'
    },
    location: {
      lat: -2.153,
      lng: 34.689,
      name: 'Serengeti National Park, Tanzania'
    },
    timestamp: '2024-01-15T10:30:00Z',
    confidence: 0.95,
    verified: true,
    notes: 'Adult male lion with distinctive mane spotted near watering hole'
  },
  {
    id: '2',
    species: {
      scientificName: 'Loxodonta africana',
      commonName: 'African Elephant',
      conservationStatus: 'EN'
    },
    observer: {
      name: 'Mark Thompson',
      role: 'Field Biologist'
    },
    location: {
      lat: -2.652,
      lng: 37.906,
      name: 'Amboseli National Park, Kenya'
    },
    timestamp: '2024-01-15T14:45:00Z',
    confidence: 0.89,
    verified: true,
    notes: 'Herd of 12 elephants including 3 juveniles'
  },
  {
    id: '3',
    species: {
      scientificName: 'Diceros bicornis',
      commonName: 'Black Rhinoceros',
      conservationStatus: 'CR'
    },
    observer: {
      name: 'Camera Trap #47',
      role: 'Automated Device'
    },
    location: {
      lat: -3.223,
      lng: 35.868,
      name: 'Ngorongoro Crater, Tanzania'
    },
    timestamp: '2024-01-15T18:20:00Z',
    confidence: 0.92,
    verified: false,
    notes: 'Single adult rhinoceros detected by camera trap'
  },
  {
    id: '4',
    species: {
      scientificName: 'Acinonyx jubatus',
      commonName: 'Cheetah',
      conservationStatus: 'VU'
    },
    observer: {
      name: 'Lisa Chen',
      role: 'Volunteer Researcher'
    },
    location: {
      lat: -1.406,
      lng: 35.009,
      name: 'Maasai Mara, Kenya'
    },
    timestamp: '2024-01-15T16:15:00Z',
    confidence: 0.87,
    verified: true,
    notes: 'Female cheetah with two cubs observed hunting'
  }
];

export default function ObservationsPage() {
  const [observations, setObservations] = useState<Observation[]>(mockObservations);
  const [filteredObservations, setFilteredObservations] = useState<Observation[]>(mockObservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [filters, setFilters] = useState({
    verified: 'all',
    conservationStatus: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    let filtered = observations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(obs => 
        obs.species.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.species.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Verification filter
    if (filters.verified !== 'all') {
      filtered = filtered.filter(obs => 
        filters.verified === 'verified' ? obs.verified : !obs.verified
      );
    }

    // Conservation status filter
    if (filters.conservationStatus !== 'all') {
      filtered = filtered.filter(obs => 
        obs.species.conservationStatus === filters.conservationStatus
      );
    }

    setFilteredObservations(filtered);
  }, [searchTerm, filters, observations]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Wildlife Observations</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and analyze wildlife sightings on an interactive map
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search species or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Verification Filter */}
            <select
              value={filters.verified}
              onChange={(e) => setFilters({...filters, verified: e.target.value})}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Observations</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>

            {/* Conservation Status Filter */}
            <select
              value={filters.conservationStatus}
              onChange={(e) => setFilters({...filters, conservationStatus: e.target.value})}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="CR">Critically Endangered</option>
              <option value="EN">Endangered</option>
              <option value="VU">Vulnerable</option>
              <option value="NT">Near Threatened</option>
              <option value="LC">Least Concern</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredObservations.length} of {observations.length} observations
            </span>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                <Layers className="h-4 w-4 mr-1" />
                Layers
              </button>
              <button className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200">
                <Filter className="h-4 w-4 mr-1" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Observation Map</h3>
              <div className="h-96 bg-gray-100 rounded-lg">
                <MapComponent 
                  observations={filteredObservations}
                  selectedObservation={selectedObservation}
                  onObservationSelect={setSelectedObservation}
                />
              </div>
            </div>
          </div>

          {/* Observations List */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Observations</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredObservations.map((observation) => (
                  <div
                    key={observation.id}
                    className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                      selectedObservation?.id === observation.id ? 'bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedObservation(observation)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {observation.species.commonName}
                        </h4>
                        <p className="text-xs italic text-gray-600">
                          {observation.species.scientificName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {observation.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(observation.species.conservationStatus)}`}>
                          {observation.species.conservationStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{observation.location.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(observation.timestamp)}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{observation.observer.name}</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        observation.confidence > 0.9 ? 'bg-green-100 text-green-800' : 
                        observation.confidence > 0.8 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(observation.confidence * 100)}% confident
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Observation Details */}
            {selectedObservation && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Observation Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedObservation.species.commonName}
                    </h4>
                    <p className="text-sm italic text-gray-600">
                      {selectedObservation.species.scientificName}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedObservation.species.conservationStatus)}`}>
                      {getStatusText(selectedObservation.species.conservationStatus)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Observer:</span>
                      <p className="text-gray-600">{selectedObservation.observer.name}</p>
                      <p className="text-gray-500 text-xs">{selectedObservation.observer.role}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <p className="text-gray-600">{formatDate(selectedObservation.timestamp)}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-600">{selectedObservation.location.name}</p>
                    <p className="text-gray-500 text-xs">
                      {selectedObservation.location.lat.toFixed(4)}, {selectedObservation.location.lng.toFixed(4)}
                    </p>
                  </div>

                  {selectedObservation.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-600 text-sm">{selectedObservation.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedObservation.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedObservation.verified ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Pending Verification
                        </>
                      )}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(selectedObservation.confidence * 100)}% AI Confidence
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
