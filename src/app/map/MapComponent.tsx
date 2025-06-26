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
import { PropertyCard } from '@/components/ui/property-card';
import { PropertyList } from '@/components/ui/property-list';
import type { FilterState } from '@/components/ui/filter-sheet';

const PAGE_SIZE = 20;

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
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const isUpdatingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<{
    center: [number, number];
    zoom: number;
  }>({
    center: [12.9716, 77.5946], // Initial Bangalore center
    zoom: 10
  });
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    prevPage: number | null;
    nextPage: number | null;
  } | null>(null);

  // Add debug logging for activeFilters changes
  useEffect(() => {
    console.log('activeFilters changed:', activeFilters);
  }, [activeFilters]);

  // Function to clear existing markers
  const clearMarkers = useCallback(() => {
    // Remove markers directly from the map
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];
  }, []);

  // Function to create URLSearchParams for property fetching
  const createFetchParams = useCallback((bounds: MapBounds, page: number = 1) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: PAGE_SIZE.toString(),
      latitudeMin: bounds.south.toString(),
      latitudeMax: bounds.north.toString(),
      longitudeMin: bounds.west.toString(),
      longitudeMax: bounds.east.toString(),
    });

    if (activeFilters) {
      if (activeFilters.propertyCategories.length > 0) {
        let propertyType = activeFilters.propertyCategories[0];
        if (propertyType === 'independent-house') {
          propertyType = 'Independent house';
        } else if (propertyType === 'plot-land') {
          propertyType = 'Plot/Land';
        }
        params.set('propertyType', propertyType);
      }

      if (activeFilters.priceRange && 
          (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 90000000)) {
        params.set('priceMin', activeFilters.priceRange.min.toString());
        params.set('priceMax', activeFilters.priceRange.max.toString());
      }

      if (activeFilters.areaRange && 
          (activeFilters.areaRange.min > 0 || activeFilters.areaRange.max < 10000)) {
        params.set('sqFeetMin', activeFilters.areaRange.min.toString());
        params.set('sqFeetMax', activeFilters.areaRange.max.toString());
      }
    }

    return params;
  }, [activeFilters]);

  // Function to fetch properties
  const fetchProperties = useCallback(async (bounds: MapBounds, page: number = 1, isLoadMore: boolean = false) => {
    try {
      const params = createFetchParams(bounds, page);
      const paramsString = params.toString();
      
      // Skip if this is the same request we just made (unless it's a loadMore request)
      if (!isLoadMore && paramsString === lastFetchParamsRef.current) {
        console.log('Skipping duplicate API request');
        return;
      }

      lastFetchParamsRef.current = paramsString;
      const apiUrl = `/api/v2/properties?${paramsString}`;
      console.log('Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch properties');
      }

      const responseData = await response.json();
      console.log('Received data:', responseData);

      if (!Array.isArray(responseData.data)) {
        console.error('Invalid data format received:', responseData);
        throw new Error('Invalid data format received from API');
      }

      // Update properties based on page number
      setVisibleProperties(prev => 
        page === 1 ? responseData.data : [...prev, ...responseData.data]
      );
      setPagination(responseData.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  }, [createFetchParams]);

  // Define handleMoveEnd
  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current || isUpdatingRef.current) return;
    
    try {
      console.log('handleMoveEnd called');
      const map = mapRef.current;
      
      // Update the view state
      const center = map.getCenter();
      const zoom = map.getZoom();
      setCurrentView({
        center: [center.lat, center.lng],
        zoom: zoom
      });

      const mapBounds = map.getBounds();
      const newBounds = {
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest()
      };
    
      setCurrentBounds(newBounds);
      if (onBoundsChange) {
        onBoundsChange(newBounds);
      }

      // Reset to first page when bounds change
      fetchProperties(newBounds, 1);
    } catch (error) {
      console.error('Error in handleMoveEnd:', error);
    }
  }, [onBoundsChange, fetchProperties]);

  // Add a loadMore function
  const loadMore = useCallback(() => {
    if (!currentBounds || !pagination?.nextPage) {
      console.log('Cannot load more: no bounds or next page');
      return;
    }

    console.log('Loading more properties, page:', pagination.nextPage);
    fetchProperties(currentBounds, pagination.nextPage, true);
  }, [currentBounds, pagination, fetchProperties]);

  // Effect for filter changes
  useEffect(() => {
    if (!isMapInitialized || !currentBounds) return;
    fetchProperties(currentBounds, 1);
  }, [activeFilters, isMapInitialized, currentBounds, fetchProperties]);

  // Initialize map only once on mount
  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current || isMapInitialized) {
      return;
    }

    console.log('Initializing map - first time setup');
    
    try {
      const map = L.map('map', { 
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
        preferCanvas: true
      });
    
      // Add zoom control with custom class for responsive visibility
      const zoomControl = L.control.zoom({ position: 'bottomright' });
      zoomControl.addTo(map);
      const zoomContainer = zoomControl.getContainer();
      if (zoomContainer) {
        zoomContainer.className += ' hidden lg:block';
      }

      map.setView(currentView.center, currentView.zoom, {
        animate: false
      });
      mapRef.current = map;

      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, © CARTO',
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2,
        maxNativeZoom: 18,
        tileSize: 256
      });

      tileLayer.on('tileerror', (error) => {
        console.error('Tile loading error:', error);
      });

      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      // Setup map ready callback
      if (onMapReady) {
        onMapReady((lat: number, lon: number) => {
          if (mapRef.current) {
            mapRef.current.setView([lat, lon], 15, { 
              animate: true, 
              duration: 1,
              easeLinearity: 0.25
            });
          }
        });
      }

      setIsMapInitialized(true);

      const actualBounds = map.getBounds();
      const bounds = {
        north: actualBounds.getNorth(),
        south: actualBounds.getSouth(),
        east: actualBounds.getEast(),
        west: actualBounds.getWest()
      };
      setCurrentBounds(bounds);

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Setup map event listeners after initialization
  useEffect(() => {
    if (!mapRef.current || !isMapInitialized) return;

    let moveEndTimeout: NodeJS.Timeout;
    const map = mapRef.current;

    const onMoveEnd = () => {
      clearTimeout(moveEndTimeout);
      moveEndTimeout = setTimeout(handleMoveEnd, 100);
    };

    map.on('moveend', onMoveEnd);

    return () => {
      map.off('moveend', onMoveEnd);
      clearTimeout(moveEndTimeout);
    };
  }, [isMapInitialized, handleMoveEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
        tileLayerRef.current = null;
      }
      markersRef.current = [];
      setIsMapInitialized(false);
    };
  }, []);

  // Add styles for smooth tile transitions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-tile-container {
        will-change: transform;
        transform-style: preserve-3d;
        backface-visibility: hidden;
      }
      .leaflet-tile {
        transition: opacity 0.2s ease;
      }
      .leaflet-fade-anim .leaflet-tile {
        will-change: opacity;
      }
      .leaflet-zoom-anim .leaflet-zoom-animated {
        will-change: transform;
        transition: transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 0.1);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Update markers when bounds or filters change
  useEffect(() => {
    if (!mapRef.current || !currentBounds || !isMapInitialized) return;

    const updateMarkersWithDelay = () => {
      if (isUpdatingRef.current) {
        console.log('Skipping marker update - update already in progress');
        return;
      }

      console.log('Updating markers for properties:', visibleProperties.length);
      isUpdatingRef.current = true;

      try {
        clearMarkers();
        
        const groupedProperties = groupPropertiesByLocation(visibleProperties);
      
        groupedProperties.forEach((propsAtLocation, coords) => {
          const [baseLat, baseLng] = coords.split(',').map(Number);
          
          // Calculate spread radius based on zoom level
          const map = mapRef.current;
          const zoom = map?.getZoom() || 15;
          const baseSpread = 0.002 * Math.pow(2, 15 - zoom);

          propsAtLocation.forEach((property, index) => {
            // Create a circular spread pattern
            const angle = (index * (360 / propsAtLocation.length)) * (Math.PI / 180);
            const latOffset = Math.cos(angle) * baseSpread;
            const lngOffset = Math.sin(angle) * baseSpread;
            
            const lat = baseLat + latOffset;
            const lng = baseLng + lngOffset;

            const formattedPrice = formatPriceInCrores(Number(property.price_overall));

            const icon = L.divIcon({
              className: 'leaflet-marker-custom',
              html: ReactDOMServer.renderToString(
                <MarkerButton 
                  price={formattedPrice.replace('₹', '')} 
                  lastUpdated={property.upload_date}
                  propertyType={property.property_type}
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
            // Add marker directly to the map instead of cluster
            marker.addTo(mapRef.current!);
          });
        });
      } finally {
        isUpdatingRef.current = false;
      }
    };

    requestAnimationFrame(updateMarkersWithDelay);

    return () => {
      isUpdatingRef.current = false;
    };
  }, [visibleProperties, clearMarkers]);

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
        #map {
          border-radius: 0.5rem;
        }
        /* Add smooth transitions for map tiles and panning */
        .leaflet-tile {
          transition: opacity 0.2s ease;
        }
        .leaflet-tile-container {
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        .leaflet-fade-anim .leaflet-tile {
          will-change: opacity;
        }
        .leaflet-zoom-anim .leaflet-zoom-animated {
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>
      <div className="relative h-full w-full rounded-lg">
        <div id="map" className="h-full w-full  rounded-lg border border-gray-200 overflow-hidden" style={{borderRadius: '16px'}}></div>

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
          pagination={pagination}
          onLoadMore={loadMore}
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