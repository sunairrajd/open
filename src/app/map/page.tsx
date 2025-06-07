'use client';

import dynamic from 'next/dynamic';
import listings from '../../../public/dummy_real_estate_listings_adjusted.json';
import { Header } from '@/components/ui/header';
import { useState, useCallback } from 'react';
import type { FilterState } from '@/components/ui/filter-sheet';

// Import MapComponent with no SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[70vh] flex items-center justify-center">Loading map...</div>
});

export default function MapPage() {
  const [setMapView, setSetMapView] = useState<((lat: number, lon: number) => void) | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [currentBounds, setCurrentBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  const handleMapReady = useCallback((setView: (lat: number, lon: number) => void) => {
    console.log('Map is ready');
    setSetMapView(() => setView);
  }, []);

  const handleLocationSelect = useCallback((lat: number, lon: number) => {
    console.log('Location selected:', lat, lon);
    if (setMapView) {
      setMapView(lat, lon);
    }
  }, [setMapView]);

  const handleFiltersChange = (filters: FilterState) => {
    console.log('Filters applied:', filters);
    setActiveFilters(filters);
  };

  // Filter properties based on active filters and current bounds
  const filteredProperties = activeFilters
    ? listings.filter(property => {
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

        // Then apply other filters
        if (activeFilters.propertyType && property.PropertyType.toLowerCase() !== activeFilters.propertyType) {
          return false;
        }

        if (property.Price < activeFilters.priceRange.min || property.Price > activeFilters.priceRange.max) {
          return false;
        }

        if (property['Area(Sqft)'] < activeFilters.areaRange.min || property['Area(Sqft)'] > activeFilters.areaRange.max) {
          return false;
        }

        return true;
      })
    : listings;

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onLocationSelect={handleLocationSelect} 
        onFiltersChange={handleFiltersChange}
      />
      <main className="flex-1 relative w-full px-4 rounded-lg">
        <div className="absolute inset-0 mx-4 mb-4 rounded-2xl overflow-hidden">
          <MapComponent 
            properties={filteredProperties}
            onMapReady={handleMapReady}
            onBoundsChange={setCurrentBounds}
            activeFilters={activeFilters}
            className="rounded-lg"
          />
        </div>
      </main>
    </div>
  );
}
