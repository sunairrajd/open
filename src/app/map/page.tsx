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

  const handleMapReady = useCallback((setView: (lat: number, lon: number) => void) => {
    console.log('Map is ready'); // Debug log
    setSetMapView(() => setView);
  }, []);

  const handleLocationSelect = useCallback((lat: number, lon: number) => {
    console.log('Location selected:', lat, lon); // Debug log
    if (setMapView) {
      setMapView(lat, lon);
    }
  }, [setMapView]);

  const handleFiltersChange = useCallback((filters: FilterState) => {
    console.log('Filters changed:', filters);
    setActiveFilters(filters);
  }, []);

  // Filter properties based on active filters
  const filteredProperties = activeFilters
    ? listings.filter(property => {
        // Property type filter
        if (activeFilters.propertyType && property.PropertyType.toLowerCase() !== activeFilters.propertyType) {
          return false;
        }

        // Price range filter
        if (property.Price < activeFilters.priceRange.min || property.Price > activeFilters.priceRange.max) {
          return false;
        }

        // Area filter
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
      <main className="flex-1 relative w-full">
        <div className="absolute inset-0">
          <MapComponent 
            properties={filteredProperties}
            onMapReady={handleMapReady}
          />
        </div>
      </main>
    </div>
  );
}
