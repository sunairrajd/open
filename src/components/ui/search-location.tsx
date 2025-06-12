'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: string[];
  place_id?: string;
}

interface SearchLocationProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

export function SearchLocation({ onLocationSelect }: SearchLocationProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
      setOpen(data.length > 0); // Only open if we have results
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocations(search);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search, searchLocations]);

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon));
    setOpen(false);
    setResults([]);
    setSearch(result.display_name.split(',')[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length < 3) {
      setOpen(false);
      setResults([]);
    }
  };

  return (
    <div className="relative w-full" style={{ zIndex: 1000 }}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none z-[1001]" />
            <Input
              type="text"
              placeholder="HSR layout, Koramangala"
              className="text-base md:text-sm pl-8 w-full bg-gray-100 border-none shadow-none"
              value={search}
              onChange={handleInputChange}
            />
            {isSearching && (
              <div className="absolute right-2.5 top-2.5 h-4 w-4">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
              </div>
            )}
          </div>
        </PopoverTrigger>
        {results.length > 0 && (
          <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] p-0" 
            align="start"
            style={{ zIndex: 1001 }}
            sideOffset={4}
          >
            <Command className="rounded-lg  shadow-md">
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={`${result.display_name}-${result.lat}-${result.lon}`}
                    onSelect={() => handleSelect(result)}
                    className="flex flex-col items-start py-2 pr-3 pl-7 gap-0 cursor-pointer hover:bg-accent"
                  >
                    <span className="text-xs">{result.display_name.split(',')[0]}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.display_name.split(',').slice(1, 3).join(',')}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
} 