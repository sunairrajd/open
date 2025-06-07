'use client';

import { SearchLocation } from "./search-location";
import { FilterSheet } from "./filter-sheet";
import type { FilterState } from "./filter-sheet";
import Image from "next/image";
import { Button } from "./button";
import { Hand } from "lucide-react";
interface HeaderProps {
  onLocationSelect: (lat: number, lon: number) => void;
  onFiltersChange: (filters: FilterState) => void;
}

export function Header({ onLocationSelect, onFiltersChange }: HeaderProps) {
  return (
    <header className="relative" style={{ zIndex: 1000 }}>
      <div className="container-fluid mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo/Title */}
        <div className="flex items-center ">
          {/* <span className="text-lg font-semibold font-sans">Open Property</span> */}
          <Image className="block md:hidden" src="/moblogo.png" alt="Open Property" height={32} width={32} />
          <Image className="hidden md:block" src="/logo.png" alt="Open Property" height={26} width={98} />
        
        </div>

        {/* Search Bar and Filters */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <SearchLocation onLocationSelect={onLocationSelect} />
          <FilterSheet onFiltersChange={onFiltersChange} />
        </div>
        <Button variant="text" className=" hidden md:flex !text-pinkbrand">
        <Hand />
          Request a feature
        </Button>
      </div>
    </header>
  );
} 