'use client';

import { SearchLocation } from "./search-location";
import { FilterSheet } from "./filter-sheet";
import type { FilterState } from "./filter-sheet";

interface HeaderProps {
  onLocationSelect: (lat: number, lon: number) => void;
  onFiltersChange: (filters: FilterState) => void;
}

export function Header({ onLocationSelect, onFiltersChange }: HeaderProps) {
  return (
    <header className="border-b relative" style={{ zIndex: 1000 }}>
      <div className="container-fluid mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold font-sans">Open Property</span>
          <span className="text-sm text-muted-foreground">Bangalore</span>
        </div>

        {/* Search Bar and Filters */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <SearchLocation onLocationSelect={onLocationSelect} />
          <FilterSheet onFiltersChange={onFiltersChange} />
        </div>
      </div>
    </header>
  );
} 