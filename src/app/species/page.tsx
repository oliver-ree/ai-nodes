'use client';

import Layout from '@/components/Layout';
import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit,
  Eye,
  MapPin,
  Calendar,
  AlertTriangle,
  Leaf,
  Camera,
  ExternalLink,
  Download
} from 'lucide-react';

interface Species {
  id: string;
  scientificName: string;
  commonName: string;
  kingdom: 'Animalia' | 'Plantae' | 'Fungi';
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  conservationStatus: 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX' | 'DD' | 'NE';
  habitat: string;
  description: string;
  imageUrl?: string;
  observations: number;
  lastSeen?: string;
  nativeRegions: string[];
  threats?: string[];
  population?: string;
}

// Mock species data
const mockSpecies: Species[] = [
  {
    id: '1',
    scientificName: 'Panthera leo',
    commonName: 'African Lion',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    genus: 'Panthera',
    conservationStatus: 'VU',
    habitat: 'Grasslands, savannas, and open woodlands',
    description: 'The lion is a large felid of the genus Panthera native to Africa and India. Adult male lions are notable for their mane, which grows between 1 and 10 years of age.',
    observations: 145,
    lastSeen: '2024-01-15T10:30:00Z',
    nativeRegions: ['Sub-Saharan Africa', 'India (Gir Forest)'],
    threats: ['Habitat loss', 'Human-wildlife conflict', 'Hunting'],
    population: '20,000-25,000 individuals'
  },
  {
    id: '2',
    scientificName: 'Loxodonta africana',
    commonName: 'African Elephant',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Proboscidea',
    family: 'Elephantidae',
    genus: 'Loxodonta',
    conservationStatus: 'EN',
    habitat: 'Savannas, forests, and grasslands',
    description: 'The African bush elephant is the largest living terrestrial animal. Both males and females have tusks, which are used for digging and stripping bark.',
    observations: 89,
    lastSeen: '2024-01-15T14:45:00Z',
    nativeRegions: ['Sub-Saharan Africa'],
    threats: ['Poaching for ivory', 'Habitat fragmentation', 'Human encroachment'],
    population: '415,000 individuals'
  },
  {
    id: '3',
    scientificName: 'Diceros bicornis',
    commonName: 'Black Rhinoceros',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Perissodactyla',
    family: 'Rhinocerotidae',
    genus: 'Diceros',
    conservationStatus: 'CR',
    habitat: 'Savannas, grasslands, and tropical bushlands',
    description: 'The black rhinoceros is a critically endangered species with two horns made of keratin. Despite its name, it is typically gray in color.',
    observations: 23,
    lastSeen: '2024-01-15T18:20:00Z',
    nativeRegions: ['Eastern and Southern Africa'],
    threats: ['Poaching for horns', 'Habitat loss', 'Political instability'],
    population: '5,500 individuals'
  },
  {
    id: '4',
    scientificName: 'Acinonyx jubatus',
    commonName: 'Cheetah',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    genus: 'Acinonyx',
    conservationStatus: 'VU',
    habitat: 'Grasslands, savannas, and semi-deserts',
    description: 'The cheetah is the fastest land animal, capable of running 70 mph. It has a distinctive spotted coat and a lean build adapted for speed.',
    observations: 67,
    lastSeen: '2024-01-15T16:15:00Z',
    nativeRegions: ['Africa', 'Iran'],
    threats: ['Habitat loss', 'Human-wildlife conflict', 'Low genetic diversity'],
    population: '7,000 individuals'
  },
  {
    id: '5',
    scientificName: 'Adansonia digitata',
    commonName: 'African Baobab',
    kingdom: 'Plantae',
    phylum: 'Angiosperms',
    class: 'Eudicots',
    order: 'Malvales',
    family: 'Malvaceae',
    genus: 'Adansonia',
    conservationStatus: 'LC',
    habitat: 'Arid savannas and dry woodlands',
    description: 'The baobab is a distinctive tree with a massive trunk that can store water. It can live for thousands of years and is culturally significant in Africa.',
    observations: 234,
    lastSeen: '2024-01-14T09:00:00Z',
    nativeRegions: ['Sub-Saharan Africa'],
    threats: ['Climate change', 'Deforestation', 'Over-harvesting'],
    population: 'Unknown, declining in some regions'
  }
];

export default function SpeciesPage() {
  const [species] = useState<Species[]>(mockSpecies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [filters, setFilters] = useState({
    kingdom: 'all',
    conservationStatus: 'all',
    sortBy: 'commonName'
  });

  const filteredAndSortedSpecies = useMemo(() => {
    let filtered = species;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.family.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Kingdom filter
    if (filters.kingdom !== 'all') {
      filtered = filtered.filter(s => s.kingdom === filters.kingdom);
    }

    // Conservation status filter
    if (filters.conservationStatus !== 'all') {
      filtered = filtered.filter(s => s.conservationStatus === filters.conservationStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'scientificName':
          return a.scientificName.localeCompare(b.scientificName);
        case 'conservationStatus':
          return a.conservationStatus.localeCompare(b.conservationStatus);
        case 'observations':
          return b.observations - a.observations;
        case 'lastSeen':
          if (!a.lastSeen && !b.lastSeen) return 0;
          if (!a.lastSeen) return 1;
          if (!b.lastSeen) return -1;
          return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
        default: // commonName
          return a.commonName.localeCompare(b.commonName);
      }
    });

    return filtered;
  }, [species, searchTerm, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LC': return 'bg-green-100 text-green-800';
      case 'NT': return 'bg-yellow-100 text-yellow-800';
      case 'VU': return 'bg-orange-100 text-orange-800';
      case 'EN': return 'bg-red-100 text-red-800';
      case 'CR': return 'bg-red-200 text-red-900';
      case 'EX': return 'bg-gray-200 text-gray-900';
      case 'EW': return 'bg-gray-100 text-gray-800';
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
      case 'EW': return 'Extinct in Wild';
      case 'EX': return 'Extinct';
      case 'DD': return 'Data Deficient';
      case 'NE': return 'Not Evaluated';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Species Database</h1>
              <p className="mt-1 text-sm text-gray-600">
                Comprehensive database of wildlife and plant species
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Species
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search species..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Kingdom Filter */}
            <select
              value={filters.kingdom}
              onChange={(e) => setFilters({...filters, kingdom: e.target.value})}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Kingdoms</option>
              <option value="Animalia">Animalia</option>
              <option value="Plantae">Plantae</option>
              <option value="Fungi">Fungi</option>
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

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="commonName">Common Name</option>
              <option value="scientificName">Scientific Name</option>
              <option value="conservationStatus">Conservation Status</option>
              <option value="observations">Observations</option>
              <option value="lastSeen">Last Seen</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedSpecies.length} of {species.length} species
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Species List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Species List</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredAndSortedSpecies.map((item) => (
                  <div
                    key={item.id}
                    className={`p-6 cursor-pointer hover:bg-gray-50 ${
                      selectedSpecies?.id === item.id ? 'bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedSpecies(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {item.kingdom === 'Plantae' ? (
                              <Leaf className="w-4 h-4 text-green-600" />
                            ) : (
                              <Camera className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {item.commonName}
                            </h4>
                            <p className="text-sm italic text-gray-600">
                              {item.scientificName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>Family: {item.family}</span>
                          <span>•</span>
                          <span>{item.observations} observations</span>
                          {item.lastSeen && (
                            <>
                              <span>•</span>
                              <span>Last seen: {formatDate(item.lastSeen)}</span>
                            </>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.conservationStatus)}`}>
                          {item.conservationStatus}
                        </span>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MapPin className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Species Details */}
          <div className="space-y-6">
            {selectedSpecies ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Species Details</h3>
                    <button className="text-blue-600 hover:text-blue-700">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {selectedSpecies.commonName}
                      </h4>
                      <p className="text-lg italic text-gray-600">
                        {selectedSpecies.scientificName}
                      </p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSpecies.conservationStatus)}`}>
                        {getStatusText(selectedSpecies.conservationStatus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Kingdom:</span>
                        <p className="text-gray-600">{selectedSpecies.kingdom}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phylum:</span>
                        <p className="text-gray-600">{selectedSpecies.phylum}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Class:</span>
                        <p className="text-gray-600">{selectedSpecies.class}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Order:</span>
                        <p className="text-gray-600">{selectedSpecies.order}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Family:</span>
                        <p className="text-gray-600">{selectedSpecies.family}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Genus:</span>
                        <p className="text-gray-600">{selectedSpecies.genus}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-600 text-sm mt-1">{selectedSpecies.description}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Habitat:</span>
                      <p className="text-gray-600 text-sm mt-1">{selectedSpecies.habitat}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Native Regions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedSpecies.nativeRegions.map((region, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedSpecies.population && (
                      <div>
                        <span className="font-medium text-gray-700">Population:</span>
                        <p className="text-gray-600 text-sm mt-1">{selectedSpecies.population}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSpecies.threats && selectedSpecies.threats.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-6">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <h4 className="font-medium text-red-900">Conservation Threats</h4>
                    </div>
                    <ul className="space-y-1">
                      {selectedSpecies.threats.map((threat, index) => (
                        <li key={index} className="text-sm text-red-800">
                          • {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Observation Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Observations:</span>
                      <span className="font-semibold text-gray-900">{selectedSpecies.observations}</span>
                    </div>
                    {selectedSpecies.lastSeen && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Observed:</span>
                        <span className="font-semibold text-gray-900">{formatDate(selectedSpecies.lastSeen)}</span>
                      </div>
                    )}
                    <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      View All Observations
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a species to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
