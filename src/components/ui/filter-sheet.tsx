'use client';

import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export interface FilterState {
  propertyType: string;
  priceRange: {
    min: number;
    max: number;
  };
  areaRange: {
    min: number;
    max: number;
  };
}

const PROPERTY_TYPES = [
  { value: '1bhk', label: '1 BHK' },
  { value: '2bhk', label: '2 BHK' },
  { value: '3bhk', label: '3 BHK' },
  { value: '4bhk', label: '4 BHK' },
];

const MAX_PRICE = 90000000; // 9 Crore
const MAX_AREA = 10000; // sqft

interface FilterSheetProps {
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterSheet({ onFiltersChange }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const [filters, setFilters] = useState<FilterState>({
    propertyType: '',
    priceRange: {
      min: 0,
      max: MAX_PRICE,
    },
    areaRange: {
      min: 0,
      max: MAX_AREA,
    },
  });

  const getActiveFilterCount = () => {
    let count = 0;
    
    // Count property type if selected
    if (filters.propertyType) count++;
    
    // Count price range if modified
    if (filters.priceRange.min > 0 || filters.priceRange.max < MAX_PRICE) count++;
    
    // Count area range if modified
    if (filters.areaRange.min > 0 || filters.areaRange.max < MAX_AREA) count++;
    
    return count;
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    setOpen(false);
  };

  const formatPrice = (value: number) => {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  };

  const formatArea = (value: number) => {
    return `${value} sqft`;
  };

  return (
    <>
      <style jsx global>{`
        [data-overlay-container] {
          z-index: 9999 !important;
        }
        .fixed[data-overlay-container] {
          z-index: 9999 !important;
        }
        [role="dialog"] {
          z-index: 9999 !important;
        }
        /* Prevent background color change */
        [data-overlay-container] > div {
          background-color: transparent !important;
        }
        /* Keep header white */
        header {
          background-color: white !important;
        }
      `}</style>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <div className="relative inline-block">
            <Button variant="outline" size="sm">
              Filters
            </Button>
            {getActiveFilterCount() > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0"
                variant="secondary"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
        </SheetTrigger>
        <SheetContent 
          side={isDesktop ? "right" : "bottom"}
          className={`z-[9999] ${isDesktop ? 'w-[400px]' : 'h-[80vh]'} bg-white`}
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="py-4 flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Property Type */}
              <div>
                <h3 className="text-sm font-medium mb-3">Property Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFilters(prev => ({ ...prev, propertyType: type.value }))}
                      className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                        filters.propertyType === type.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-accent'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="space-y-5">
                  <Slider
                    defaultValue={[0, MAX_PRICE]}
                    max={MAX_PRICE}
                    step={1000000} // 10 Lakhs
                    value={[filters.priceRange.min, filters.priceRange.max]}
                    onValueChange={([min, max]) => 
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { min, max }
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(filters.priceRange.min)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(filters.priceRange.max)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Area Range */}
              <div>
                <h3 className="text-sm font-medium mb-3">Area (Sqft)</h3>
                <div className="space-y-5">
                  <Slider
                    defaultValue={[0, MAX_AREA]}
                    max={MAX_AREA}
                    step={100}
                    value={[filters.areaRange.min, filters.areaRange.max]}
                    onValueChange={([min, max]) => 
                      setFilters(prev => ({
                        ...prev,
                        areaRange: { min, max }
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground">
                      {formatArea(filters.areaRange.min)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatArea(filters.areaRange.max)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={handleApplyFilters}
              className="w-full"
            >
              Apply Filters
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const defaultFilters = {
                  propertyType: '',
                  priceRange: { min: 0, max: MAX_PRICE },
                  areaRange: { min: 0, max: MAX_AREA },
                };
                setFilters(defaultFilters);
                onFiltersChange(defaultFilters);
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
} 