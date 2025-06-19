'use client';

import { Property } from "@/app/map/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp  } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { useState, useRef } from 'react';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  setMapView?: (lat: number, lon: number) => void;
}

const formatPriceInCrores = (price: string) => {
  const crores = (Number(price) / 10000000).toFixed(2);
  return `₹${crores}Cr`;
};

const formatTimeAgo = (date: string) => {
  try {
    // Test if the date is valid
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }

    const now = new Date();
    const diffInDays = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Show 🔥 New for properties less than 30 days old
    if (diffInDays <= 30) {
      return '🔥 New';
    }

    const distance = formatDistanceToNow(parsedDate, { addSuffix: false });
    console.log('Date:', date, 'Distance:', distance, 'Days diff:', diffInDays);
    
    return distance
      .replace(' months', 'mo')
      .replace(' month', 'mo')
      .replace(' years', 'y')
      .replace(' year', 'y')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace('about ', '')
      .replace('over ', '')
      .replace('almost ', '')
      .replace('less than ', '<') + ' ago';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date unknown';
  }
};

const formatTypology = (typology: string | null | undefined): string => {
  if (!typology) return '';
  try {
    const types = JSON.parse(typology);
    return Array.isArray(types) ? types.join('/') : '';
  } catch (error) {
    console.error('Error parsing typology:', error);
    return '';
  }
};

export function PropertyList({ properties, onPropertyClick, setMapView }: PropertyListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handlePropertyClick = (property: Property) => {
    onPropertyClick(property);
    if (setMapView) {
      setMapView(Number(property.latitude), Number(property.longitude));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;

    // If scrolled up more than 50px while at the top, expand
    if (diff > 50 && !isExpanded && scrollAreaRef.current?.scrollTop === 0) {
      setIsExpanded(true);
      setIsDragging(false);
    }
    // If scrolled down more than 50px while expanded and at the top, collapse
    else if (diff < -50 && isExpanded && scrollAreaRef.current?.scrollTop === 0) {
      setIsExpanded(false);
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      className={`fixed lg:right-4 lg:top-20 lg:left-8 lg:rounded-xl rounded-t-lg rounded-b-none lg:w-[420px] lg:bottom-4 lg:h-auto 
                fixed bottom-0 left-0 right-0 
                ${isExpanded ? 'h-[calc(100dvh-4rem)]' : 'h-[80px]'} 
                lg:h-[calc(100dvh-7rem)]
                bg-white lg:bg-white/80 backdrop-blur-sm shadow-lg z-[9998]
                transition-all duration-300 ease-in-out`}
    >
      <CardContent 
        className="p-4 pt-0 h-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={headerRef} className="flex justify-between items-center mb-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="lg:text-sm md:text-lg font-semibold">{properties.length} properties found</h2>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-0 hover:bg-transparent"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown 
                  className="text-primary !w-8 !h-8" 
                  style={{ width: '4px', height: '4px' }}
                  strokeWidth={2.5} 
                />
              ) : (
                <ChevronUp
                  className="text-primary !w-8 !h-8" 
                  style={{ width: '4px', height: '4px' }}
                  strokeWidth={2.5} 
                />
              )}
            </Button>
          </div>
        </div>
        <div ref={scrollAreaRef} className={`${isExpanded ? 'h-[calc(100dvh-10rem)]' : 'h-[calc(40dvh-6rem)]'} lg:h-[calc(100dvh-10rem)] overflow-auto pb-safe scrollbar-hide`}>
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;  /* Chrome, Safari and Opera */
            }
          `}</style>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max px-4 lg:px-0">
            {properties.map((property, index) => (
              <div
                key={`${property.cleaned_location}-${index}`}
                className="flex flex-col rounded-xl hover:bg-accent/10 cursor-pointer transition-colors overflow-hidden w-full lg:w-[184px] mx-auto"
                onClick={() => handlePropertyClick(property)}
              >
                {/* Thumbnail - 16:9 ratio */}
                <div className="relative w-full lg:w-[184px] aspect-[9/16] rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`px-1 py-1 text-[10px] rounded-md font-medium backdrop-blur-sm ${
                      formatTimeAgo(property.upload_date).includes('New')
                        ? 'bg-white text-primary'
                        : 'bg-white text-primary'
                    }`}>
                      {formatTimeAgo(property.upload_date)}
                    </span>
                  </div>
                  {property.youtube_id ? (
                    <Image
                      src={`https://img.youtube.com/vi/${property.youtube_id}/hqdefault.jpg`}
                      alt={`${property.property_type} at ${property.cleaned_location}`}
                      fill
                      // unoptimized={true}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 184px"
                      onError={(e) => {
                        // If maxresdefault fails, try hqdefault
                        const img = e.target as HTMLImageElement;
                        if (img.src.includes('maxresdefault')) {
                          img.src = `https://img.youtube.com/vi/${property.youtube_id}/hqdefault.jpg`;
                        } else if (img.src.includes('hqdefault')) {
                          // If hqdefault fails, try mqdefault
                          img.src = `https://img.youtube.com/vi/${property.youtube_id}/mqdefault.jpg`;
                        } else if (img.src.includes('mqdefault')) {
                          // If mqdefault fails, try default
                          img.src = `https://img.youtube.com/vi/${property.youtube_id}/default.jpg`;
                        }
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-accent flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="px-1 py-2 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-base text-sm"><span className="font-semibold">
                      {formatPriceInCrores(property.price_overall)}</span> <span className="font-regular text-sm">({property.property_type})</span>
                    </p>
                  
                  </div>
                  <p className="text-base text-xs">
                      {formatTypology(property.typology)}
                    </p>
                  <p className="text-xs text-base font-regular text-muted-foreground">
                    {property.sqft} sqft · {property.cleaned_location}
                  </p>
                  <p className="text-xs font-regular text-muted-foreground line-clamp-1"></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 