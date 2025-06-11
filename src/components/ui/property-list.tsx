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
      className={`fixed lg:right-4 lg:top-20 lg:left-8 lg:w-[400px] lg:bottom-4 lg:h-auto 
                fixed bottom-0 left-0 right-0 
                ${isExpanded ? 'h-[calc(100vh-4rem)]' : 'h-[40vh]'} 
                lg:h-[calc(100vh-7rem)]
                bg-white lg:bg-white/80 backdrop-blur-sm shadow-lg z-[998]
                transition-all duration-300 ease-in-out`}
    >
      <CardContent 
        className="p-4 h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
       
        <div ref={headerRef} className="flex justify-between items-center mb-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold">{properties.length} Properties found</h2>
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
        <div ref={scrollAreaRef} className={`${isExpanded ? 'h-[calc(100vh-10rem)]' : 'h-[calc(40vh-6rem)]'} lg:h-[calc(100vh-10rem)] overflow-auto pr-4`}>
          <div className="space-y-4">
            {properties.map((property, index) => (
              <div
                key={`${property.Location}-${index}`}
                className="flex gap-4 p-3 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
                onClick={() => handlePropertyClick(property)}
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={`https://img.youtube.com/vi/${property.YoutubeID}/hqdefault.jpg`}
                    alt={`${property.PropertyType} at ${property.Location}`}
                    fill
                    className="object-cover"
                    sizes="84px"
                  />
                </div>

                {/* Property Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">
                    {formatPriceInCrores(property.Price)}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {property.PropertyType} · {property['Area(Sqft)']} sqft
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {property.Location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {formatDistanceToNow(new Date(property.LastUpdated), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 