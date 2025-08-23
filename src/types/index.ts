// Core types for the conservation platform

export interface Species {
  id: string;
  scientificName: string;
  commonName: string;
  kingdom: 'Animalia' | 'Plantae' | 'Fungi' | 'Protista' | 'Archaea' | 'Bacteria';
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  conservationStatus: 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX' | 'DD' | 'NE';
  habitat: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Observation {
  id: string;
  speciesId: string;
  species?: Species;
  observerId: string;
  observer?: User;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
  imageUrls: string[];
  audioUrls?: string[];
  videoUrls?: string[];
  notes?: string;
  confidence: number; // AI confidence score 0-1
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  deviceType?: 'camera_trap' | 'drone' | 'satellite' | 'mobile' | 'manual';
  environmentalData?: {
    temperature?: number;
    humidity?: number;
    weather?: string;
    season?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'researcher' | 'conservationist' | 'admin' | 'volunteer';
  affiliation?: string;
  expertise?: string[];
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leader?: User;
  members: User[];
  species: Species[];
  observations: Observation[];
  bbox: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  };
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  tags: string[];
  visibility: 'public' | 'private' | 'restricted';
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsData {
  totalObservations: number;
  totalSpecies: number;
  activeProjects: number;
  recentTrends: {
    period: string;
    observations: number;
    species: number;
  }[];
  topSpecies: {
    species: Species;
    count: number;
  }[];
  conservationStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  geographicDistribution: {
    region: string;
    count: number;
    coordinates: [number, number];
  }[];
}

export interface AIIdentification {
  id: string;
  observationId: string;
  suggestions: {
    speciesId: string;
    species: Species;
    confidence: number;
    reasoning?: string;
  }[];
  processingTime: number;
  modelVersion: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface MonitoringDevice {
  id: string;
  name: string;
  type: 'camera_trap' | 'acoustic_sensor' | 'drone' | 'satellite';
  latitude: number;
  longitude: number;
  altitude?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  lastSync?: Date;
  batteryLevel?: number;
  storageUsed?: number;
  storageCapacity?: number;
  projectId: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
