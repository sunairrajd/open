'use client';

import React from 'react';
import dynamic from 'next/dynamic';
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

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <Header 
        onLocationSelect={handleLocationSelect} 
        onFiltersChange={handleFiltersChange}
      />
      <main className="flex-1 relative w-full overflow-hidden rounded-lg">
        <div className="absolute inset-0 overflow-hidden rounded-2xl mx-4 mb-4 ">
          <MapComponent 
            properties={[]}
            onMapReady={handleMapReady}
            onBoundsChange={setCurrentBounds}
            activeFilters={activeFilters}
          />
        </div>
      </main>
    </div>
  );
}
