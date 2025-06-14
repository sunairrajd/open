'use client';

import { SearchLocation } from "./search-location";
import { FilterSheet } from "./filter-sheet";
import type { FilterState } from "./filter-sheet";
import Image from "next/image";
import { Button } from "./button";
import { Hand } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface HeaderProps {
  onLocationSelect: (lat: number, lon: number) => void;
  onFiltersChange: (filters: FilterState) => void;
}

export function Header({ onLocationSelect, onFiltersChange }: HeaderProps) {
  const [feature, setFeature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submit
    setTimeout(() => {
      setSubmitting(false);
      setFeature("");
      // Optionally show a toast or feedback
    }, 1000);
  };
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="text" className="hidden md:flex !text-pinkbrand">
              <Hand />
              Request a feature
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 flex flex-col gap-2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <Textarea
                value={feature}
                onChange={e => setFeature(e.target.value)}
                placeholder="Help us improve the service"
                disabled={submitting}
                className="text-base md:text-xs min-h-[80px]"
                required
              />
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !feature.trim()}
                className="w-full text-white text-xs cursor-pointer"
                style={{ 
                  backgroundColor: 'var(--pinkbrand)'
                }}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
} 