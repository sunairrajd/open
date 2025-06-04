'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix Leaflet's default icon path issues with proper typing
interface IconDefault extends L.Icon {
  _getIconUrl?: string;
}
const IconDefault = L.Icon.Default as unknown as { prototype: IconDefault };
delete IconDefault.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

interface Property {
  YoutubeLink: string;
  Price: number;
  Location: string;
  PropertyType: string;
  'Area(Sqft)': number;
  LastUpdated: string;
  ThumbnailLink: string;
  Coordinates: string;
}

interface MapComponentProps {
  properties: Property[];
  style?: React.CSSProperties;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Function to format price in Crores
const formatPriceInCrores = (price: number) => {
  const crores = (price / 10000000).toFixed(2);
  return `₹${crores}Cr`;
};

// Function to check if a property is within bounds
const isPropertyInBounds = (property: Property, bounds: MapBounds) => {
  const [lat, lng] = property.Coordinates.split(',').map(Number);
  return (
    lat <= bounds.north &&
    lat >= bounds.south &&
    lng <= bounds.east &&
    lng >= bounds.west
  );
};

const formatCoordinate = (coord: number): string => {
  return coord.toFixed(4);
};

export default function MapComponent({ properties, style }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Default bounds
  const DEFAULT_BOUNDS = {
    north: 12.9883,
    south: 12.9450,
    east: 77.6836,
    west: 77.5764
  };

  // Function to clear existing markers
  const clearMarkers = useCallback(() => {
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
    }
    markersRef.current = [];
  }, []);

  // Function to add markers within bounds
  const addMarkersInBounds = useCallback(async () => {
    if (!mapRef.current) return;

    setIsLoading(true);
    
    try {
      const bounds = mapRef.current.getBounds();
      const mapBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };
      
      setCurrentBounds(mapBounds);

      // Clear existing markers
      clearMarkers();

      // Filter properties within bounds and limit to 500
      const visibleProperties = properties
        .filter(property => isPropertyInBounds(property, mapBounds))
        .slice(0, 500);

      setVisibleCount(visibleProperties.length);

      // Add new markers
      visibleProperties.forEach((property) => {
        const [lat, lng] = property.Coordinates.split(',').map(Number);
        const formattedPrice = formatPriceInCrores(property.Price);

        const icon = L.divIcon({
          className: 'bg-white px-2 py-1 rounded border-2 border-blue-500 text-sm font-bold shadow-md',
          html: formattedPrice,
          iconSize: [60, 24],
          iconAnchor: [30, 12]
        });

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(`
            <div class="text-center">
              <h3 class="font-bold">${formattedPrice}</h3>
              <p>${property.PropertyType} - ${property['Area(Sqft)']}sqft</p>
              <p>${property.Location}</p>
            </div>
          `);

        markersRef.current.push(marker);
        markerClusterRef.current?.addLayer(marker);
      });
    } finally {
      setIsLoading(false);
    }
  }, [properties, clearMarkers]);

  // Debounced version of addMarkersInBounds
  const debouncedAddMarkers = useCallback(() => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      addMarkersInBounds();
    }, 1000); // 1 second delay
  }, [addMarkersInBounds]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !mapRef.current) {
      // Initialize the map with bounds
      const map = L.map('map');
      
      // Set view to the center of the bounding box
      const centerLat = (DEFAULT_BOUNDS.north + DEFAULT_BOUNDS.south) / 2;
      const centerLng = (DEFAULT_BOUNDS.east + DEFAULT_BOUNDS.west) / 2;
      
      map.setView([centerLat, centerLng], 13);
      
      // Fit to exact bounds
      const southWest = L.latLng(DEFAULT_BOUNDS.south, DEFAULT_BOUNDS.west);
      const northEast = L.latLng(DEFAULT_BOUNDS.north, DEFAULT_BOUNDS.east);
      const bounds = L.latLngBounds(southWest, northEast);
      map.fitBounds(bounds);

      mapRef.current = map;

      // Add the tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Create a marker cluster group with custom options
      const markerCluster = L.markerClusterGroup({
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          const prices = cluster.getAllChildMarkers()
            .map(marker => {
              const html = (marker.getIcon().options as L.DivIconOptions).html as string;
              return parseFloat(html.replace('₹', '').replace('Cr', ''));
            });
          
          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const formattedAvgPrice = `₹${avgPrice.toFixed(2)}Cr`;
          
          return L.divIcon({
            html: `<div class="cluster-icon">
              <span class="price">${formattedAvgPrice}</span>
              <span class="count">${count}</span>
            </div>`,
            className: 'bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-bold',
            iconSize: L.point(60, 40)
          } as L.DivIconOptions);
        }
      });

      // Add the cluster group to the map
      map.addLayer(markerCluster);
      markerClusterRef.current = markerCluster;

      // Add event listeners for map movement using debounced function
      map.on('moveend', debouncedAddMarkers);
      map.on('zoomend', debouncedAddMarkers);

      // Initial load of markers
      addMarkersInBounds();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerClusterRef.current = null;
        markersRef.current = [];
      }
      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    addMarkersInBounds,
    debouncedAddMarkers,
    DEFAULT_BOUNDS.north,
    DEFAULT_BOUNDS.south,
    DEFAULT_BOUNDS.east,
    DEFAULT_BOUNDS.west
  ]);

  return (
    <>
      <style jsx global>{`
        .cluster-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          line-height: 1.2;
        }
        .cluster-icon .price {
          font-size: 0.75rem;
        }
        .cluster-icon .count {
          font-size: 0.7rem;
          opacity: 0.9;
        }
      `}</style>
      <div className="relative">
        <div id="map" style={{ ...style, minHeight: '500px' }}></div>
        
        {/* Status overlay */}
        <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg border border-gray-200" style={{zIndex: 1000}}>
          {isLoading ? (
            <div className="flex items-center space-x-2 text-gray-900">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span>Loading properties...</span>
            </div>
          ) : currentBounds && (
            <div className="text-sm text-gray-900">
              <div className="font-bold mb-2 text-base">Properties in view: {visibleCount}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="font-medium">North: {formatCoordinate(currentBounds.north)}°</div>
                <div className="font-medium">South: {formatCoordinate(currentBounds.south)}°</div>
                <div className="font-medium">East: {formatCoordinate(currentBounds.east)}°</div>
                <div className="font-medium">West: {formatCoordinate(currentBounds.west)}°</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 