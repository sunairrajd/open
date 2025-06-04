'use client';

import dynamic from 'next/dynamic';
import listings from '../../../public/dummy_real_estate_listings_adjusted.json';

// Import MapComponent with no SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[70vh] flex items-center justify-center">Loading map...</div>
});

export default function MapPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Property Map</h1>
      <MapComponent 
        properties={listings}
        style={{ height: '70vh', width: '100%' }}
      />
    </div>
  );
}
