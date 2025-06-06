'use client';

import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import type { Property } from './types';
import { MarkerButton } from '@/components/ui/marker-button';
import ReactDOMServer from 'react-dom/server';
import { ClusterMarker } from '@/components/ui/cluster-marker';
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyList } from '@/components/ui/property-list';
import type { FilterState } from '@/components/ui/filter-sheet';

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

interface MapComponentProps {
  properties: Property[];
  onMapReady?: (setView: (lat: number, lon: number) => void) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  activeFilters: FilterState | null;
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

export default function MapComponent({ 
  properties, 
  onMapReady, 
  onBoundsChange,
  activeFilters 
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([]);

  // Default bounds
  const DEFAULT_BOUNDS = {
    north: 12.9883,
    south: 12.9450,
    east: 77.6836,
    west: 77.5764
  };

  // Function to calculate cluster radius based on zoom level
  const getClusterRadius = (zoom: number) => {
    // At max zoom (19), radius should be very small
    // At min zoom (10), radius should be larger
    const maxRadius = 80;  // Maximum clustering radius
    const minRadius = 10;  // Minimum clustering radius
    const maxZoom = 19;
    const minZoom = 10;
    
    // Linear interpolation between max and min radius based on zoom
    const radius = maxRadius - ((zoom - minZoom) * (maxRadius - minRadius) / (maxZoom - minZoom));
    return Math.max(minRadius, Math.min(maxRadius, radius));
  };

  // Function to clear existing markers
  const clearMarkers = useCallback(() => {
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
    }
    markersRef.current = [];
  }, []);

  // Add this function to group properties by coordinates
  const groupPropertiesByLocation = (properties: Property[]) => {
    const groups = new Map<string, Property[]>();
    
    properties.forEach(property => {
      const coords = property.Coordinates;
      if (!groups.has(coords)) {
        groups.set(coords, []);
      }
      groups.get(coords)?.push(property);
    });

    return groups;
  };

  // Single effect to handle all updates
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !currentBounds) return;

    // Clear existing markers
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
    }
    markersRef.current = [];
    
    // Filter properties by bounds first
    let filteredProperties = properties.filter(property => 
      isPropertyInBounds(property, currentBounds)
    );

    // Then apply active filters if they exist
    if (activeFilters) {
      filteredProperties = filteredProperties.filter(property => {
        if (activeFilters.propertyCategory && 
            property.PropertyType.toLowerCase() !== activeFilters.propertyCategory.toLowerCase()) {
          return false;
        }

        if ((activeFilters.propertyCategory === 'apartment' || 
             activeFilters.propertyCategory === 'independent-house') && 
            activeFilters.propertyType &&
            property.PropertyType.toLowerCase() !== activeFilters.propertyType.toLowerCase()) {
          return false;
        }

        if (activeFilters.priceRange &&
            (property.Price < activeFilters.priceRange.min || 
             property.Price > activeFilters.priceRange.max)) {
          return false;
        }

        if (activeFilters.areaRange &&
            (property['Area(Sqft)'] < activeFilters.areaRange.min || 
             property['Area(Sqft)'] > activeFilters.areaRange.max)) {
          return false;
        }

        return true;
      });
    }

    setVisibleProperties(filteredProperties);

    // Create markers for filtered properties
    const groupedProperties = groupPropertiesByLocation(filteredProperties);
    let count = 0;

    groupedProperties.forEach((propsAtLocation, coords) => {
      const [baseLat, baseLng] = coords.split(',').map(Number);
      
      propsAtLocation.forEach((property, index) => {
        const offset = index * 0.00002;
        const lat = baseLat + offset;
        const lng = baseLng + offset;

        const formattedPrice = formatPriceInCrores(property.Price);

        const icon = L.divIcon({
          className: 'leaflet-marker-custom',
          html: ReactDOMServer.renderToString(
            <MarkerButton 
              price={formattedPrice.replace('₹', '')} 
              lastUpdated={property.LastUpdated}
            />
          ),
          iconSize: [60, 24],
          iconAnchor: [30, 12]
        });

        const marker = L.marker([lat, lng], { icon });
        marker.on('click', () => setSelectedProperty(property));

        if (propsAtLocation.length > 1) {
          const popupContent = `
            <div class="text-center">
              <h3 class="font-bold text-lg mb-2">${propsAtLocation.length} Properties</h3>
              ${propsAtLocation.map(p => `
                <div class="border-b py-2 cursor-pointer hover:bg-accent/10" onclick="window.showProperty(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                  <div class="font-bold">${formatPriceInCrores(p.Price)}</div>
                  <div>${p.PropertyType} - ${p['Area(Sqft)']}sqft</div>
                  <div>${p.Location}</div>
                </div>
              `).join('')}
            </div>
          `;
          marker.bindPopup(popupContent);
        }

        markersRef.current.push(marker);
        markerClusterRef.current?.addLayer(marker);
      });

      count += propsAtLocation.length;
    });

    setVisibleCount(count);

    // Add global function to handle property selection from popup
    window.showProperty = (property: Property) => {
      setSelectedProperty(property);
    };
  }, [properties, activeFilters, currentBounds]);

  // Effect to trigger updates
  useEffect(() => {
    if (!mapRef.current || !currentBounds) return;
    const timeoutId = setTimeout(updateMarkers, 100);
    return () => clearTimeout(timeoutId);
  }, [updateMarkers, currentBounds]);

  // Handle map move events
  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return;
    
    const bounds = mapRef.current.getBounds();
    const newBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
    
    // Only update bounds if they've changed significantly
    if (!currentBounds || 
        Math.abs(currentBounds.north - newBounds.north) > 0.0001 ||
        Math.abs(currentBounds.south - newBounds.south) > 0.0001 ||
        Math.abs(currentBounds.east - newBounds.east) > 0.0001 ||
        Math.abs(currentBounds.west - newBounds.west) > 0.0001) {
      setCurrentBounds(newBounds);
      if (onBoundsChange) {
        onBoundsChange(newBounds);
      }
    }
  }, [currentBounds, onBoundsChange]);

  // Update the map initialization to properly handle bounds
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapRef.current) {
      const map = L.map('map');
      
      // Set initial view with default bounds
      const southWest = L.latLng(DEFAULT_BOUNDS.south, DEFAULT_BOUNDS.west);
      const northEast = L.latLng(DEFAULT_BOUNDS.north, DEFAULT_BOUNDS.east);
      const bounds = L.latLngBounds(southWest, northEast);
      
      map.fitBounds(bounds);
      setCurrentBounds(DEFAULT_BOUNDS);
      
      mapRef.current = map;

      // Add the tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 16,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Create marker cluster group
      const markerCluster = L.markerClusterGroup({
        maxClusterRadius: getClusterRadius,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        animate: true,
        animateAddingMarkers: true,
        disableClusteringAtZoom: 17,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          const html = ReactDOMServer.renderToString(
            <ClusterMarker count={count} />
          );
          const size = Math.min(60 + Math.log2(count) * 10, 100);
          return L.divIcon({
            html: html,
            className: 'leaflet-marker-custom',
            iconSize: L.point(size, Math.max(40, size * 0.6))
          });
        }
      });

      map.addLayer(markerCluster);
      markerClusterRef.current = markerCluster;

      // Only update bounds on manual pan/zoom
      map.on('moveend', handleMoveEnd);

      // Initial markers
      clearMarkers();

      // Setup location change handler
      if (onMapReady) {
        onMapReady((lat: number, lon: number) => {
          map.setView([lat, lon], 15, {
            animate: true,
            duration: 1
          });
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerClusterRef.current = null;
        markersRef.current = [];
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
          padding: 4px 8px;
          transition: all 0.2s ease;
        }
        .cluster-icon .price {
          font-size: 0.85rem;
          font-weight: bold;
        }
        .cluster-icon .count {
          font-size: 0.75rem;
          opacity: 0.9;
        }
        .leaflet-marker-icon {
          transition: all 0.3s ease;
        }
      `}</style>
      <div className="relative h-full w-full">
        <div id="map" className="h-full w-full"></div>
        
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

        {/* Property List */}
        <PropertyList 
          properties={visibleProperties}
          onPropertyClick={setSelectedProperty}
        />

        {/* Property Card */}
        {selectedProperty && (
          <PropertyCard 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)} 
          />
        )}
      </div>
    </>
  );
} 