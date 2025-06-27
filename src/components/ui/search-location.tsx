'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

// Add UUID generation function
function generateUUID() {
  // Check if crypto.randomUUID is available
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback to manual UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// We only need a subset of the prediction fields
interface SearchResult {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface SearchLocationProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

export function SearchLocation({ onLocationSelect }: SearchLocationProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const sessionToken = useRef<string>(generateUUID());
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

  const searchLocations = useCallback(async (query: string) => {
    console.log('Searching locations for query:', query);
    if (!query || query.length < 4) {
      console.log('Search cancelled: Query too short');
      setResults([]);
      setOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(query)}&sessiontoken=${sessionToken.current}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`Failed to fetch predictions: ${response.status} ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Received predictions:', data);
      
      if (data.predictions) {
        setResults(data.predictions);
        setOpen(data.predictions.length > 0);
      } else if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(`API Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setResults([]);
      setOpen(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelect = async (result: SearchResult) => {
    console.log('Selected result:', result);
    setOpen(false); // Close popover immediately
    setResults([]); // Clear results immediately

    try {
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          placeId: result.place_id,
          sessionToken: sessionToken.current 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }

      const data = await response.json();
      console.log('Place details:', data);

      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        console.log('Location found:', { lat, lng });
        onLocationSelect(lat, lng);
        updateSearch(result.structured_formatting.main_text, true);
        // Update to use new generateUUID function
        sessionToken.current = generateUUID();
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      // Show the error to the user
      updateSearch('Error fetching location details', true);
      setTimeout(() => {
        updateSearch('', true);
      }, 2000);
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
  );
} 