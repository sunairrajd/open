'use client';

import { Property } from "@/app/map/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp  } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { useState, useRef } from 'react';
import { ArrowLeftFromLine, ArrowRightToLine } from "lucide-react";

interface PropertyListProps {
  properties: Property[];
  onPropertyClick: (property: Property | null) => void;
  setMapView?: (lat: number, lon: number) => void;
}

const formatPriceInCrores = (price: string) => {
  if (price === '0' || price === '0.00' || !price) return '· · ·';
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

const formatPropertyCount = (count: number): string => {
  if (count <= 20) return count.toString();
  if (count <= 40) return "20+";
  if (count <= 60) return "40+";
  if (count <= 80) return "60+";
  if (count <= 100) return "80+";
  if (count <= 150) return "100+";
  if (count <= 200) return "150+";
  if (count <= 300) return "200+";
  if (count <= 400) return "300+";
  if (count <= 500) return "400+";
  
  // For counts between 500 and 100000, show increments of 100
  if (count <= 100000) {
    const hundreds = Math.floor(count / 100) * 100;
    if (hundreds === count) return count.toString();
    return `${hundreds}+`;
  }
  
  return "100000+";
};

const formatPropertyType = (type: string): string => {
  switch(type) {
    case 'I': return 'Ind. house';
    case 'F': return 'Flat';
    case 'L': return 'Land';
    case 'V': return 'Villa';
    default: return type;
  }
};

export function PropertyList({ properties, onPropertyClick, setMapView }: PropertyListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
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
      className={`fixed lg:right-4 lg:top-20 lg:left-8  rounded-t-2xl lg:rounded-t-2xl rounded-b-none bottom-0 lg:border-0 lg:rounded-b-2xl lg:w-[480px] lg:bottom-8   pb-0 
                fixed border-t-1 border-x-0 left-0 right-0 
                ${isExpanded ? 'h-[calc(100dvh-4rem)] pb-0 lg:pb-6 ' : 'h-[114px]'} 
                ${isDesktopExpanded ? 'lg:w-[480px] lg:h-[calc(100dvh-7rem)] lg:pb-6 lg:h-auto' : 'lg:w-[300px] lg:h-[90px] pb-6'}
                bg-white lg:bg-white/80 backdrop-blur-sm shadow-lg z-[9998]
                transition-[height,width,padding,transform] duration-500 ease-in-out
                overscroll-none`}
    >
      <CardContent 
        className={`pt-0 h-full overflow-hidden ${isDesktopExpanded ? 'px-4 pb-4' : 'px-4 pb-0'}
                   transition-[padding,opacity] duration-500 ease-in-out`} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={headerRef} className="flex justify-between items-center mb-4 px-0 lg:px-4">
          <div className="flex items-center justify-between w-full">
            <h2 className="lg:text-sm md:text-lg font-semibold transition-transform duration-500 ease-in-out">{formatPropertyCount(properties.length)} properties found</h2>
            <div className={`${isDesktopExpanded ? 'flex items-center gap-2' : 'flex items-center gap-2'}`}>
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex items-center justify-center p-0 hover:bg-transparent transition-transform duration-500 cursor-pointer"
                onClick={() => {
                  setIsDesktopExpanded(!isDesktopExpanded);
                  if (isDesktopExpanded) {
                    onPropertyClick(null);
                  }
                }}
              >
                {isDesktopExpanded ? (
                  <ArrowLeftFromLine
                    className="text-primary !w-5 !h-5 transition-transform duration-500" 
                    strokeWidth={2} 
                  />
                ) : (
                  <ArrowRightToLine
                    className="text-primary !w-5 !h-5 transition-transform duration-500" 
                    strokeWidth={2} 
                  />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-0 hover:bg-transparent transition-transform duration-500 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown 
                    className="text-primary !w-8 !h-8 transition-transform duration-500" 
                    style={{ width: '4px', height: '4px' }}
                    strokeWidth={2} 
                  />
                ) : (
                  <ChevronUp
                    className="text-primary !w-8 !h-8 transition-transform duration-500" 
                    style={{ width: '4px', height: '4px' }}
                    strokeWidth={2} 
                  />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div 
          ref={scrollAreaRef} 
          className={`${isExpanded ? 'h-[calc(100dvh-10rem)]' : 'h-[calc(40dvh-6rem)]'} 
                      lg:h-[${isDesktopExpanded ? 'calc(100dvh-10rem)' : '0px'}] overflow-auto pb-safe scrollbar-hide
                      transition-[height,opacity] duration-500 ease-in-out
                      overscroll-none`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
              -webkit-overflow-scrolling: touch;  /* Enable momentum scrolling on iOS */
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;  /* Chrome, Safari and Opera */
            }
            html {
              height: -webkit-fill-available;
            }
            body {
              min-height: -webkit-fill-available;
              overscroll-behavior-y: none;
            }
            .overscroll-none {
              overscroll-behavior-y: none;
              -webkit-overflow-scrolling: touch;
            }
          `}</style>
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max px-0 lg:px-2
                          ${!isDesktopExpanded && 'lg:hidden'}
                          transition-[opacity,transform] duration-500 ease-in-out
                          ${isDesktopExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {properties.map((property, index) => (
              <div
                key={`${property.cleaned_location}-${index}`}
                className="flex flex-col rounded-xl hover:bg-accent/10 cursor-pointer transition-colors overflow-hidden w-full lg:w-[184px] mx-auto"
                onClick={() => handlePropertyClick(property)}
              >
                {/* Thumbnail */}
                <div className={`relative w-full lg:w-[184px] ${
                  property.video_type === 'F' 
                    ? 'lg:aspect-[9/16] aspect-video' 
                    : 'aspect-[9/16]'
                } rounded-lg overflow-hidden`}>
                  <div className="absolute top-2 right-2 z-10">
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
                      className="object-cover bg-gray-100 scale-[1.02]"
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
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="px-1 py-2 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="flex justify-between items-center w-full">
                      <span className="font-semibold  text-base lg:text-sm">
                        {formatPriceInCrores(property.price_overall)}
                      </span>
                      <span className="font-regular text-base lg:text-sm text-muted-foreground">
                        {formatPropertyType(property.property_type)}
                      </span>
                    </p>
                  </div>
                  <p className="lg:text-xs text-sm mt-1">
                      {formatTypology(property.typology)}
                    </p>
                  <p className="lg:text-xs text-sm text-base font-regular text-muted-foreground">
                    {property.sqft} sqft · {property.cleaned_location}
                  </p>
                  <p className="lg:text-xs text-sm font-regular text-muted-foreground line-clamp-1"></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 