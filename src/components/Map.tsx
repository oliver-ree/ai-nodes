'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
  notes?: string;
}

interface MapProps {
  observations: Observation[];
  selectedObservation?: Observation | null;
  onObservationSelect?: (observation: Observation) => void;
}

// Custom icons for different conservation statuses
const createCustomIcon = (status: string, isSelected: boolean = false) => {
  const getColor = (status: string) => {
    switch (status) {
      case 'CR': return '#7F1D1D'; // Dark red for Critically Endangered
      case 'EN': return '#DC2626'; // Red for Endangered
      case 'VU': return '#EA580C'; // Orange for Vulnerable
      case 'NT': return '#D97706'; // Amber for Near Threatened
      case 'LC': return '#059669'; // Green for Least Concern
      default: return '#6B7280'; // Gray for unknown
    }
  };

  const color = getColor(status);
  const size = isSelected ? 35 : 25;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size > 30 ? '14px' : '10px'};
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      ">
        ${status}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Component to fit map bounds to observations
function FitBounds({ observations }: { observations: Observation[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (observations.length > 0) {
      const bounds = L.latLngBounds(
        observations.map(obs => [obs.location.lat, obs.location.lng])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [observations, map]);
  
  return null;
}

export default function Map({ observations, selectedObservation, onObservationSelect }: MapProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Default center (East Africa)
  const defaultCenter: [number, number] = [-2.0, 36.0];
  const defaultZoom = 6;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds observations={observations} />
        
        {observations.map((observation) => (
          <Marker
            key={observation.id}
            position={[observation.location.lat, observation.location.lng]}
            icon={createCustomIcon(
              observation.species.conservationStatus,
              selectedObservation?.id === observation.id
            )}
            eventHandlers={{
              click: () => {
                onObservationSelect?.(observation);
              },
            }}
          >
            <Popup>
              <div className="min-w-64 max-w-sm">
                <div className="space-y-3">
                  {/* Species Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {observation.species.commonName}
                    </h3>
                    <p className="text-sm italic text-gray-600">
                      {observation.species.scientificName}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                      observation.species.conservationStatus === 'CR' ? 'bg-red-200 text-red-900' :
                      observation.species.conservationStatus === 'EN' ? 'bg-red-100 text-red-800' :
                      observation.species.conservationStatus === 'VU' ? 'bg-orange-100 text-orange-800' :
                      observation.species.conservationStatus === 'NT' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getStatusText(observation.species.conservationStatus)}
                    </span>
                  </div>

                  {/* Observation Details */}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Observer:</span>
                      <span className="ml-2 text-gray-600">{observation.observer.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="ml-2 text-gray-600">{formatDate(observation.timestamp)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-600">{observation.location.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Confidence:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        observation.confidence > 0.9 ? 'bg-green-100 text-green-800' : 
                        observation.confidence > 0.8 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(observation.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      observation.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {observation.verified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </div>

                  {/* Notes */}
                  {observation.notes && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="font-medium text-gray-700 text-sm">Notes:</span>
                      <p className="text-sm text-gray-600 mt-1">{observation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
