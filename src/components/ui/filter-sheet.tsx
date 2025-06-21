'use client';

import { useState, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ListFilter } from 'lucide-react';
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
  propertyCategories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  areaRange: {
    min: number;
    max: number;
  };
}

const PROPERTY_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'independent-house', label: 'Independent House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot-land', label: 'Plot/Land' },
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
    propertyCategories: [],
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
    
    // Count property categories if selected
    if (filters.propertyCategories.length > 0) count++;
    
    // Count price range if modified
    if (filters.priceRange.min > 0 || filters.priceRange.max < MAX_PRICE) count++;
    
    // Count area range if modified
    if (filters.areaRange.min > 0 || filters.areaRange.max < MAX_AREA) count++;
    
    return count;
  };

  const handlePropertyCategoryClick = (categoryValue: string) => {
    setFilters(prev => {
      // If "All" is clicked
      if (categoryValue === 'all') {
        return {
          ...prev,
          propertyCategories: [] // Empty array means all categories
        };
      }

      let newCategories: string[];
      if (prev.propertyCategories.includes(categoryValue)) {
        // Remove the category if it's already selected
        newCategories = prev.propertyCategories.filter(c => c !== categoryValue);
      } else {
        // Add the category
        newCategories = [...prev.propertyCategories, categoryValue];
      }

      return {
        ...prev,
        propertyCategories: newCategories
      };
    });
  };

  const isPropertyCategorySelected = (categoryValue: string) => {
    if (categoryValue === 'all') {
      return filters.propertyCategories.length === 0;
    }
    return filters.propertyCategories.includes(categoryValue);
  };

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    console.log('Filter change triggered:', newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  }, [onFiltersChange]);

  const handleApplyFilters = () => {
    console.log('Applying filters:', filters);
    handleFiltersChange(filters);
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

       [data-slot="sheet-overlay"] {
    z-index: 9999 !important;
  }

        [data-overlay-container] {
          z-index: 9999 !important;
        }
        .fixed[data-overlay-container] {
          z-index: 9999 !important;
        }

          /* Add this to target the close button */
  [data-slot="close-button"] {
    cursor: pointer !important;
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
            <Button variant="outline" size="sm" className="text-xs rounder-md cursor-pointer ">
              <ListFilter className=" mx-2 md:mx-0 " />
              <span className="hidden md:inline text-xs">Filters</span>
            </Button>
            {getActiveFilterCount() > 0 && (
              <Badge
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 bg-primary text-primary-foreground text-xs"
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
          <SheetHeader className="p-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-10 p-6">
              {/* Property Category */}
              <div>
                <h3 className="text-sm font-medium mb-3">Property Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handlePropertyCategoryClick(category.value)}
                      className={`px-4 py-2 text-xs rounded-md border transition-colors ${
                        isPropertyCategorySelected(category.value)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-accent'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-medium mb-3">Price Range</h3>
                <div className="space-y-2">
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
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(filters.priceRange.min)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(filters.priceRange.max)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Area Range */}
              <div>
                <h3 className="text-sm font-medium mb-3">Area (Sqft)</h3>
                <div className="space-y-2">
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
                    <span className="text-xs text-muted-foreground">
                      {formatArea(filters.areaRange.min)}
                    </span>
                    <span className="text-xs text-muted-foreground">
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
              className="w-full text-xs"
            >
              Apply Filters
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const defaultFilters = {
                  propertyCategories: [],
                  priceRange: { min: 0, max: MAX_PRICE },
                  areaRange: { min: 0, max: MAX_AREA },
                };
                setFilters(defaultFilters);
                handleFiltersChange(defaultFilters);
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