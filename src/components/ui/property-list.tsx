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

const formatPriceInCrores = (price: number) => {
  const crores = (price / 10000000).toFixed(2);
  return `₹${crores}Cr`;
};

const formatTimeAgo = (date: Date) => {
  const distance = formatDistanceToNow(date, { addSuffix: false });
  
  // Check if less than a month old
  if (distance.includes('days') || distance.includes('hours') || distance.includes('minutes')) {
    return '🔥 New';
  }
  
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
      const [lat, lon] = property.Coordinates.split(',').map(Number);
      setMapView(lat, lon);
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
                ${isExpanded ? 'h-[calc(100vh-4rem)]' : 'h-[90px]'} 
                lg:h-[calc(100vh-7rem)]
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
        <div ref={scrollAreaRef} className={`${isExpanded ? 'h-[calc(100vh-10rem)]' : 'h-[calc(40vh-6rem)]'} lg:h-[calc(100vh-10rem)] overflow-auto `}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max px-4 lg:px-0">
            {properties.map((property, index) => (
              <div
                key={`${property.Location}-${index}`}
                className="flex flex-col rounded-lg hover:bg-accent/10 cursor-pointer transition-colors overflow-hidden w-full lg:w-[184px] mx-auto"
                onClick={() => handlePropertyClick(property)}
              >
                {/* Thumbnail - 16:9 ratio */}
                <div className="relative w-full lg:w-[184px] aspect-[9/16] rounded-lg overflow-hidden">
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`px-1 py-1 text-[10px] rounded-md font-medium backdrop-blur-sm ${
                      formatTimeAgo(new Date(property.LastUpdated)).includes('New')
                        ? 'bg-white text-primary'
                        : 'bg-white text-primary'
                    }`}>
                      {formatTimeAgo(new Date(property.LastUpdated))}
                    </span>
                  </div>
                  <Image
                    src={`https://img.youtube.com/vi/${property.YoutubeID}/maxresdefault.jpg`}
                    alt={`${property.PropertyType} at ${property.Location}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 184px"
                  />
                </div>

                {/* Property Info */}
                <div className="px-1 py-2 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-base text-sm"><span className="font-semibold">
                      {formatPriceInCrores(property.Price)}</span> <span className="font-regular text-sm">({property.PropertyType})</span>
                    </p>
                  </div>
                  <p className="text-xs text-base font-regular text-muted-foreground">
                    {property['Area(Sqft)']} sqft · {property.Location}
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