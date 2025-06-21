'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Script from 'next/script';

interface SearchResult extends google.maps.places.AutocompletePrediction {}

interface SearchLocationProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

export function SearchLocation({ onLocationSelect }: SearchLocationProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocodingService = useRef<google.maps.Geocoder | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const isProgrammaticUpdate = useRef(false);

  // Custom function to update search that distinguishes between user input and programmatic updates
  const updateSearch = useCallback((value: string, isFromSelection: boolean = false) => {
    isProgrammaticUpdate.current = isFromSelection;
    setSearch(value);
    // Reset the flag after a short delay to handle any subsequent effects
    setTimeout(() => {
      isProgrammaticUpdate.current = false;
    }, 100);
  }, []);

  // Initialize services when script loads
  const initializeServices = useCallback(() => {
    console.log('Initializing Google Maps services...');
    if (typeof window !== 'undefined' && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocodingService.current = new window.google.maps.Geocoder();
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      setIsScriptLoaded(true);
      console.log('Services initialized successfully');
    }
  }, []);

  // Check if script is already loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      console.log('Google Maps already loaded, initializing services');
      initializeServices();
    }
  }, [initializeServices]);

  // Handle script load
  const handleScriptLoad = useCallback(() => {
    console.log('Google Maps script loaded');
    initializeServices();
  }, [initializeServices]);

  const searchLocations = useCallback(async (query: string) => {
    console.log('Searching locations for query:', query);
    if (!query || query.length < 4) {
      console.log('Search cancelled: Query too short');
      setResults([]);
      setOpen(false);
      return;
    }

    if (!isScriptLoaded || !autocompleteService.current) {
      console.log('Search cancelled: Services not ready', {
        isScriptLoaded,
        hasAutocomplete: !!autocompleteService.current
      });
      return;
    }

    setIsSearching(true);
    try {
      // Create Bangalore bounds
      const bangaloreBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(12.704574, 77.350723), // SW
        new window.google.maps.LatLng(13.173706, 77.850723)  // NE
      );

      console.log('Making prediction request with params:', {
        input: query,
        sessionToken: !!sessionToken.current,
        locationBias: bangaloreBounds
      });

      const response = await autocompleteService.current.getPlacePredictions({
        input: query,
        sessionToken: sessionToken.current || undefined,
        componentRestrictions: { country: 'in' },
        locationBias: bangaloreBounds,
        types: ['geocode', 'establishment']
      });

      console.log('Received predictions:', response.predictions);
      setResults(response.predictions);
      setOpen(response.predictions.length > 0);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setIsSearching(false);
    }
  }, [isScriptLoaded]);

  const handleSelect = async (result: SearchResult) => {
    console.log('Selected result:', result);
    setOpen(false); // Close popover immediately
    setResults([]); // Clear results immediately
    
    if (!geocodingService.current) {
      console.log('Geocoding service not available');
      return;
    }

    try {
      console.log('Geocoding place_id:', result.place_id);
      const response = await geocodingService.current.geocode({
        placeId: result.place_id
      });

      console.log('Geocoding response:', response);
      if (response.results[0]?.geometry?.location) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        console.log('Location found:', { lat, lng });
        onLocationSelect(lat, lng);
        updateSearch(result.structured_formatting.main_text, true);
        // Create a new session token for the next search
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    } catch (error) {
      console.error('Error geocoding place:', error);
    }
  };

  useEffect(() => {
    console.log('Search text changed:', search, 'isProgrammatic:', isProgrammaticUpdate.current);
    
    if (isProgrammaticUpdate.current) {
      console.log('Skipping search - programmatic update');
      return;
    }

    const timer = setTimeout(() => {
      if (search.length >= 2) {
        searchLocations(search);
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, searchLocations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input changed:', value);
    updateSearch(value, false);
    if (value.length < 2) {
      setOpen(false);
      setResults([]);
    }
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`}
        onLoad={handleScriptLoad}
        onError={(e) => console.error('Error loading Google Maps script:', e)}
      />
      <div className="relative w-full" style={{ zIndex: 1000 }}>
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none z-[1001]" />
          <Input
            type="text"
            placeholder="HSR layout, Koramangala"
            className="text-base md:text-xs pl-8 w-full bg-gray-100 border-none shadow-none"
            value={search}
            onChange={handleInputChange}
          />
          {isSearching && (
            <div className="absolute right-2.5 top-2.5 h-4 w-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          )}
        </div>
        
        {/* Results dropdown */}
        {open && results.length > 0 && (
          <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[1001]">
            <div className="p-1">
              {results.map((result) => (
                <div
                  key={result.place_id}
                  onClick={() => {
                    handleSelect(result);
                  }}
                  className="flex flex-col items-start py-2 px-3 gap-0.5 cursor-pointer hover:bg-accent rounded-md"
                >
                  <span className="text-xs font-medium">{result.structured_formatting.main_text}</span>
                  <span className="text-xs text-muted-foreground">
                    {result.structured_formatting.secondary_text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 