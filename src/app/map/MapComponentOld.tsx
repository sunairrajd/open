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
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
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

export default function MapComponent({ properties, onMapReady, onBoundsChange }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>(null);

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

  // Modify the addMarkersInBounds function
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
      clearMarkers();

      // Filter properties in bounds
      const propertiesInBounds = properties.filter(property => 
        isPropertyInBounds(property, mapBounds)
      );

      // Update visible properties
      setVisibleProperties(propertiesInBounds);

      // Group properties by coordinates
      const groupedProperties = groupPropertiesByLocation(propertiesInBounds);

      let visibleCount = 0;

      // Create markers for each group
      groupedProperties.forEach((propsAtLocation, coords) => {
        const [baseLat, baseLng] = coords.split(',').map(Number);
        
        propsAtLocation.forEach((property, index) => {
          // Create slight offset for overlapping markers
          const offset = index * 0.00002; // Small offset in degrees
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

          // Handle marker click to show property card
          marker.on('click', () => {
            setSelectedProperty(property);
          });

          // If there are multiple properties, show all in popup
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

        visibleCount += propsAtLocation.length;
      });

      setVisibleCount(visibleCount);

      // Add global function to handle property selection from popup
      window.showProperty = (property: Property) => {
        setSelectedProperty(property);
      };
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

  // Update the setMapView function
  const setMapView = useCallback((lat: number, lon: number) => {
    if (mapRef.current) {
      console.log('Setting map view to:', lat, lon); // Debug log
      mapRef.current.setView([lat, lon], 15, {
        animate: true,
        duration: 1
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !mapRef.current) {
      // Initialize the map
      const map = L.map('map');
      
      // Set initial view to the center of Bangalore only if we don't have current bounds
      const centerLat = (DEFAULT_BOUNDS.north + DEFAULT_BOUNDS.south) / 2;
      const centerLng = (DEFAULT_BOUNDS.east + DEFAULT_BOUNDS.west) / 2;
      
      map.setView([centerLat, centerLng], 13);
      
      mapRef.current = map;

      // Add the tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 16,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Create a marker cluster group with custom options
      const markerCluster = L.markerClusterGroup({
        maxClusterRadius: (zoom) => getClusterRadius(zoom),
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true,
        animate: true,
        animateAddingMarkers: true,
        disableClusteringAtZoom: 17,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          
          // Use ReactDOMServer to render our cluster marker to HTML string
          const html = ReactDOMServer.renderToString(
            <ClusterMarker count={count} />
          );
          
          // Make cluster size proportional to the number of markers
          const size = Math.min(60 + Math.log2(count) * 10, 100);
          
          return L.divIcon({
            html: html,
            className: 'leaflet-marker-custom',
            iconSize: L.point(size, Math.max(40, size * 0.6))
          });
        }
      });

      // Add the cluster group to the map
      map.addLayer(markerCluster);
      markerClusterRef.current = markerCluster;

      // Add event listeners for map movement using debounced function
      map.on('moveend', () => {
        const bounds = map.getBounds();
        const newBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        };
        
        setCurrentBounds(newBounds);
        if (onBoundsChange) {
          onBoundsChange(newBounds);
        }
        debouncedAddMarkers();
      });
      map.on('zoomend', debouncedAddMarkers);

      // Initial load of markers
      addMarkersInBounds();

      // Add this line after map initialization
      if (onMapReady) {
        onMapReady(setMapView);
      }
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
    DEFAULT_BOUNDS.west,
    onMapReady,
    setMapView,
    onBoundsChange
  ]);

  // Modify this effect to maintain the current view when properties update
  useEffect(() => {
    if (!mapRef.current) return;

    // Store current center and zoom
    const currentCenter = mapRef.current.getCenter();
    const currentZoom = mapRef.current.getZoom();

    // Clear and add new markers
    clearMarkers();
    addMarkersInBounds();

    // Restore the previous view
    mapRef.current.setView(currentCenter, currentZoom, { animate: false });
  }, [properties]);

  const handleFiltersChange = useCallback((filters: any) => {
    console.log('Filters changed:', filters);
    setActiveFilters(filters);
    // Don't modify the map view here
  }, []);

  // Modify the filtered properties logic to use bounds more efficiently
  const filteredProperties = useMemo(() => {
    if (!activeFilters) return properties;

    return properties.filter(property => {
      // First check if the property is within current bounds if we have them
      if (currentBounds) {
        const [lat, lng] = property.Coordinates.split(',').map(Number);
        const isInBounds = 
          lat <= currentBounds.north &&
          lat >= currentBounds.south &&
          lng <= currentBounds.east &&
          lng >= currentBounds.west;
        
        if (!isInBounds) return false;
      }

      // Property type filters
      if (activeFilters.propertyCategory && 
          property.PropertyType.toLowerCase() !== activeFilters.propertyCategory) {
        return false;
      }

      if (activeFilters.propertyType && 
          property.PropertyType.toLowerCase() !== activeFilters.propertyType) {
        return false;
      }

      // Price range filter
      if (property.Price < activeFilters.priceRange.min || 
          property.Price > activeFilters.priceRange.max) {
        return false;
      }

      // Area filter
      if (property['Area(Sqft)'] < activeFilters.areaRange.min || 
          property['Area(Sqft)'] > activeFilters.areaRange.max) {
        return false;
      }

      return true;
    });
  }, [properties, activeFilters, currentBounds]);

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