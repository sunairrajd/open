'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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

// Add this function to group properties by coordinates
const groupPropertiesByLocation = (properties: Property[]) => {
  const groups = new Map<string, Property[]>();
  
  properties.forEach(property => {
    const coords = `${property.latitude},${property.longitude}`;
    if (!groups.has(coords)) {
      groups.set(coords, []);
    }
    groups.get(coords)?.push(property);
  });

  return groups;
};

export default function MapComponent({ 
  onMapReady, 
  onBoundsChange,
  activeFilters 
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const isUpdatingRef = useRef(false);
  const [currentView, setCurrentView] = useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: [12.9716, 77.5946], // Initial Bangalore center
    zoom: 13
  });
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([]);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add debug logging for activeFilters changes
  useEffect(() => {
    console.log('activeFilters changed:', activeFilters);
  }, [activeFilters]);

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

  // Define handleMoveEnd first
  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current || isUpdatingRef.current) return;
    
    try {
      console.log('handleMoveEnd called');
      // Always get fresh bounds from the latest map state
      const map = mapRef.current;
      const mapBounds = map.getBounds();
      const newBounds = {
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest()
      };
      
      console.log('New bounds from handleMoveEnd:', newBounds);
      setCurrentBounds(newBounds);
      if (onBoundsChange) {
        onBoundsChange(newBounds);
      }

      // Fetch properties for the new bounds
      setIsLoading(true);
      
      // Build query parameters using fresh bounds
      const params = new URLSearchParams({
        latitudeMin: newBounds.south.toString(),
        latitudeMax: newBounds.north.toString(),
        longitudeMin: newBounds.west.toString(),
        longitudeMax: newBounds.east.toString(),
      });

      // Add filter parameters if they exist
      if (activeFilters) {
        console.log('Applying filters to API request:', activeFilters);
        
        if (activeFilters.propertyCategory) {
          let propertyType = activeFilters.propertyCategory;
          if (propertyType === 'independent-house') {
            propertyType = 'Independent house';
          } else if (propertyType === 'plot-land') {
            propertyType = 'Plot/Land';
          }
          params.append('propertyType', propertyType);
        }

        if (activeFilters.propertyType) {
          const typology = activeFilters.propertyType.toUpperCase();
          params.append('typology', typology);
        }

        if (activeFilters.priceRange && 
            (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 90000000)) {
          params.append('priceMin', activeFilters.priceRange.min.toString());
          params.append('priceMax', activeFilters.priceRange.max.toString());
        }

        if (activeFilters.areaRange && 
            (activeFilters.areaRange.min > 0 || activeFilters.areaRange.max < 10000)) {
          params.append('sqFeetMin', activeFilters.areaRange.min.toString());
          params.append('sqFeetMax', activeFilters.areaRange.max.toString());
        }
      }

      const apiUrl = `/api/properties?${params.toString()}`;
      console.log('Making API request to:', apiUrl);
      
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            return response.json().then(errorData => {
              console.error('API error:', errorData);
              throw new Error(errorData.error || 'Failed to fetch properties');
            });
          }
          return response.json();
        })
        .then(data => {
          console.log('Received data:', data);
          if (!Array.isArray(data)) {
            console.error('Invalid data format received:', data);
            throw new Error('Invalid data format received from API');
          }
          setVisibleProperties(data);
        })
        .catch(error => {
          console.error('Error fetching properties:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Error in handleMoveEnd:', error);
    }
  }, [onBoundsChange, activeFilters]);

  // Initialize map - separate effect
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return;

    console.log('Initializing map');
    try {
      const map = L.map('map', { 
        zoomControl: false,
        attributionControl: false
      });
    
      // Add zoom control with custom class for responsive visibility
      const zoomControl = L.control.zoom({ position: 'bottomright' });
      zoomControl.addTo(map);
      // Add custom class to zoom control container
      const zoomContainer = zoomControl.getContainer();
      if (zoomContainer) {
        zoomContainer.className += ' hidden lg:block';
      }

      // Set initial view to Bangalore center - only use this for first load
      map.setView(currentView.center, currentView.zoom);
      mapRef.current = map;

      // Add tile layer with error handling
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, © CARTO'
      });

      tileLayer.on('tileerror', (error) => {
        console.error('Tile loading error:', error);
      });

      tileLayer.addTo(map);

      // Wait for both map and tiles to be ready
      Promise.all([
        new Promise(resolve => map.whenReady(resolve)),
        new Promise(resolve => tileLayer.on('load', resolve))
      ]).then(() => {
        console.log('Map and tiles fully loaded');
        setIsMapInitialized(true);
        
        try {
          const actualBounds = map.getBounds();
          const bounds = {
            north: actualBounds.getNorth(),
            south: actualBounds.getSouth(),
            east: actualBounds.getEast(),
            west: actualBounds.getWest()
          };
          console.log('Initial map bounds set after view:', bounds);
          setCurrentBounds(bounds);
        } catch (error) {
          console.error('Error getting initial bounds:', error);
        }
      });

      // Add event listeners for map movement
      map.on('moveend', () => {
        if (!mapRef.current || isUpdatingRef.current) return;
        
        try {
          console.log('Map moved/zoomed');
          const center = mapRef.current.getCenter();
          const zoom = mapRef.current.getZoom();
          console.log('New map position:', { center, zoom });

          // Update the view state
          setCurrentView({
            center: [center.lat, center.lng],
            zoom: zoom
          });

          isUpdatingRef.current = true; // Set flag before update
          map.setView([center.lat, center.lng], zoom);
          mapRef.current = map;
          isUpdatingRef.current = false; // Reset flag after update
          
          // Get fresh bounds from the map after updating ref
          const bounds = mapRef.current.getBounds();
          console.log('Fresh bounds after map update-----', bounds);
          handleMoveEnd();
        } catch (error) {
          console.error('Error in moveend handler:', error);
          isUpdatingRef.current = false; // Make sure to reset flag even if there's an error
        }
      });

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
      
      // Only call onMapReady once during initialization
      if (onMapReady) {
        onMapReady((lat: number, lon: number) => {
          if (mapRef.current) {
            console.log('Setting map view to:', lat, lon);
            mapRef.current.once('moveend', () => {
              // Get fresh bounds after the move is complete
              const newBounds = mapRef.current?.getBounds();
              console.log('New bounds after setView:', newBounds);
              
              // Update the view state
              if (mapRef.current) {
                const center = mapRef.current.getCenter();
                const zoom = mapRef.current.getZoom();
                setCurrentView({
                  center: [center.lat, center.lng],
                  zoom: zoom
                });
              }
              
              handleMoveEnd();
            });
            mapRef.current.setView([lat, lon], 15, { animate: true, duration: 1 });
            console.log('Map set view-----', lat, lon);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerClusterRef.current = null;
      markersRef.current = [];
      console.log('MapComponent unmounted');
    };
  }, [handleMoveEnd, onMapReady]);

  // Add a new effect to handle filter changes
  useEffect(() => {
    console.log('Filter effect triggered with filters:', activeFilters);
    if (!isMapInitialized || !mapRef.current) {
      console.log('Map not ready yet');
      return;
    }

    try {
  
      const mapBounds = mapRef.current.getBounds();
      console.log('Current map bounds from filter effect:', mapBounds);
      
      // Fetch properties for current bounds with new filters
      setIsLoading(true);
      const fetchProperties = async () => {
        try {
          const params = new URLSearchParams({
            latitudeMin: mapBounds.getSouth().toString(),
            latitudeMax: mapBounds.getNorth().toString(),
            longitudeMin: mapBounds.getWest().toString(),
            longitudeMax: mapBounds.getEast().toString(),
          });

          // Add filter parameters if they exist
          if (activeFilters) {
            console.log('Applying filters to API request:', activeFilters);
            
            if (activeFilters.propertyCategory) {
              let propertyType = activeFilters.propertyCategory;
              if (propertyType === 'independent-house') {
                propertyType = 'Independenthouse';
              } else if (propertyType === 'plot-land') {
                propertyType = 'Plot';
              }
              params.append('propertyType', propertyType);
            }

            if (activeFilters.propertyType) {
              const typology = activeFilters.propertyType.toUpperCase();
              params.append('typology', typology);
            }

            if (activeFilters.priceRange && 
                (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 90000000)) {
              params.append('priceMin', activeFilters.priceRange.min.toString());
              params.append('priceMax', activeFilters.priceRange.max.toString());
            }

            if (activeFilters.areaRange && 
                (activeFilters.areaRange.min > 0 || activeFilters.areaRange.max < 10000)) {
              params.append('sqFeetMin', activeFilters.areaRange.min.toString());
              params.append('sqFeetMax', activeFilters.areaRange.max.toString());
            }
          }

          const apiUrl = `/api/properties?${params.toString()}`;
          console.log('Making API request to:', apiUrl);
          
          const response = await fetch(apiUrl);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch properties');
          }

          const data = await response.json();
          console.log('Received data:', data);
          
          if (!Array.isArray(data)) {
            console.error('Invalid data format received:', data);
            throw new Error('Invalid data format received from API');
          }

          setVisibleProperties(data);
        } catch (error) {
          console.error('Error fetching properties:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProperties();
    } catch (error) {
      console.error('Error in filter effect:', error);
    }
  }, [activeFilters, isMapInitialized]);

  // Update markers when bounds or filters change
  useEffect(() => {
    if (!mapRef.current || !currentBounds || !isMapInitialized) return;
    console.log('Updating markers with bounds:', currentBounds);

    const updateMarkersWithDelay = () => {
      clearMarkers();
      
      // Create markers for properties
      const groupedProperties = groupPropertiesByLocation(visibleProperties);
      
      groupedProperties.forEach((propsAtLocation, coords) => {
        const [baseLat, baseLng] = coords.split(',').map(Number);
        
        propsAtLocation.forEach((property, index) => {
          const offset = index * 0.00002;
          const lat = baseLat + offset;
          const lng = baseLng + offset;

          const formattedPrice = formatPriceInCrores(Number(property.price_overall));

          const icon = L.divIcon({
            className: 'leaflet-marker-custom',
            html: ReactDOMServer.renderToString(
              <MarkerButton 
                price={formattedPrice.replace('₹', '')} 
                lastUpdated={property.last_synced_date}
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
                    <div class="font-bold">${formatPriceInCrores(Number(p.price_overall))}</div>
                    <div>${p.property_type} - ${p.sqft}sqft</div>
                    <div>${p.cleaned_location}</div>
                  </div>
                `).join('')}
              </div>
            `;
            marker.bindPopup(popupContent);
          }

          markersRef.current.push(marker);
          markerClusterRef.current?.addLayer(marker);
        });
      });
    };

    const timeoutId = setTimeout(updateMarkersWithDelay, 100);
    return () => clearTimeout(timeoutId);
  }, [visibleProperties, currentBounds, isMapInitialized, clearMarkers]);

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
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-[1000001]">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              Loading properties...
            </div>
          </div>
        )}
        
        {/* Status overlay */}
        {/* <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg border border-gray-200" style={{zIndex: 1000000}}>
          {currentBounds && (
            <div className="text-sm text-gray-900">
              <div className="font-bold mb-2 text-base">Properties in view:</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="font-medium">North: {currentBounds.north}°</div>
                <div className="font-medium">South: {currentBounds.south}°</div>
                <div className="font-medium">East: {currentBounds.east}°</div>
                <div className="font-medium">West: {currentBounds.west}°</div>
              </div>
            </div>
          )}
        </div> */}

        {/* Property List */}
        <PropertyList 
          properties={visibleProperties}
          onPropertyClick={setSelectedProperty}
          setMapView={(lat, lon) => {
            if (mapRef.current) {
              mapRef.current.setView([lat, lon], 16, {
                animate: true,
                duration: 1
              });
            }
          }}
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