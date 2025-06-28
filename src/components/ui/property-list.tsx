'use client';

import { Property } from "@/app/map/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Play, Video } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';
import { useState, useRef } from 'react';
import { ArrowLeftFromLine, ArrowRightToLine } from "lucide-react";
import { formatPriceInCrores } from "@/lib/utils";

interface PropertyListProps {
  properties: Property[];
  onPropertyClick: (property: Property | null) => void;
  setMapView?: (lat: number, lon: number) => void;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    prevPage: number | null;
    nextPage: number | null;
  } | null;
  onLoadMore?: () => void;
}

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
    // console.log('Date:', date, 'Distance:', distance, 'Days diff:', diffInDays);
    
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

const formatPropertyType = (type: string): string => {
  switch(type) {
    case 'I': return 'Ind. house';
    case 'F': return 'Flat';
    case 'L': return 'Land';
    case 'V': return 'Villa';
    default: return type;
  }
};

export function PropertyList({ 
  properties, 
  onPropertyClick, 
  setMapView,
  pagination,
  onLoadMore 
}: PropertyListProps) {
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
      className={`lg:fixed lg:right-4 lg:top-20 lg:left-8 rounded-t-2xl  pt-2 lg:pt-6 lg:rounded-t-2xl rounded-b-none lg:bottom-8 lg:border-0 lg:rounded-b-2xl lg:w-[480px] pb-0 
                sticky bottom-0 border-t-1 border-x-0 left-0 right-0  overflow-hidden
                ${isExpanded ? 'h-[calc(100vh-4rem)] pb-0 lg:pb-6' : 'h-[94px]'} 
                ${isDesktopExpanded ? 'lg:w-[480px] lg:h-[calc(100vh-7rem)] lg:pb-6 lg:h-auto' : 'lg:w-[300px] lg:h-[90px] pb-6'}
                bg-white lg:bg-white/80 backdrop-blur-sm shadow-lg z-[9998]
                transition-[height,width,padding,transform] duration-500 ease-in-out`}
    >
      <CardContent 
        className={`pt-0 h-full ${isDesktopExpanded ? 'px-4 pb-4' : 'px-4 pb-0'}
                   transition-[padding,opacity] duration-500 ease-in-out`} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Bottom Sheet Handle */}
        <div className="flex justify-center w-full  lg:hidden">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header Content */}
        <div 
          className="flex items-center justify-between  cursor-pointer lg:cursor-default p-2 mb-2 lg:mx-3 active:bg-accent/5"
          onClick={() => {
            if (window.innerWidth < 1024) {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <h3 className="lg:text-sm md:text-lg font-medium transition-transform duration-500 ease-in-out flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" strokeWidth={2} />
            {pagination?.total ? `${pagination.total} properties found` : `${properties.length} properties found`}
          </h3>
          <div className={`${isDesktopExpanded ? 'flex items-center gap-2' : 'flex items-center gap-2'}`}>
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex items-center justify-center p-0 hover:bg-transparent transition-transform duration-500 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
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
              className="lg:hidden p-0 hover:bg-transparent px-0 transition-transform duration-500"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronDown 
                  className="text-primary !w-6 !h-6 transition-transform duration-500" 
                  strokeWidth={2} 
                />
              ) : (
                <ChevronUp
                  className="text-primary !w-6 !h-6 transition-transform duration-500" 
                  strokeWidth={2} 
                />
              )}
            </Button>
          </div>
        </div>
        <div 
          ref={scrollAreaRef} 
          className={`
            ${isExpanded ? 'max-lg:h-[calc(100vh-10rem)]' : 'max-lg:h-[calc(40vh-6rem)]'}
            ${isDesktopExpanded ? 'lg:h-[calc(100vh-13rem)]' : 'lg:h-[0px]'}
            overflow-y-auto overflow-x-hidden
            flex flex-col
            -webkit-overflow-scrolling: touch
          `}
        >
          <style jsx global>{`
            html {
              height: 100%;
              scroll-behavior: smooth;
            }
            
            body {
              min-height: 100%;
              padding-bottom: 94px; /* Height of collapsed property list */
            }

            @media (max-width: 1024px) {
              .sticky {
                position: sticky;
                bottom: 0;
                left: 0;
                right: 0;
              }
            }

            /* Make only the property list content scrollable */
            .overflow-y-auto {
              scrollbar-width: none;
              -ms-overflow-style: none;
              -webkit-overflow-scrolling: touch;
              overscroll-behavior-y: none;
            }
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-max px-0 lg:px-2 flex-1
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
                } rounded-lg overflow-hidden group`}>
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
                    <>
                      <Image
                        src={`https://img.youtube.com/vi/${property.youtube_id}/hqdefault.jpg`}
                        alt={`${property.property_type} at ${property.cleaned_location}`}
                        fill
                        className="object-cover bg-gray-100 scale-[1.02] group-hover:scale-[1.05] transition-transform duration-300"
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
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-black/70 transition-colors duration-300">
                          <Play className="w-6 h-6 text-white fill-white" strokeWidth={1.5} />
                        </div>
                      </div>
                    </>
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
                    {property.sqft && property.sqft > 0 ? `${property.sqft} sqft · ` : ''}{property.cleaned_location}
                  </p>
                  <p className="lg:text-xs text-sm font-regular text-muted-foreground line-clamp-1"></p>
                </div>
              </div>
            ))}
          </div>
          
         
          {/* Load More Button */}
          {pagination?.nextPage && properties.length > 0 && (
            <div className="w-full bg-white/80 backdrop-blur-sm pt-4 lg:pt-2 pb-6 px-0 lg:px-4 mt-0 mb-8 flex-shrink-0">
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLoadMore?.();
                }}
                className="w-full cursor-pointer pointer-cursor bg-white hover:bg-accent/10 flex items-center justify-center gap-2 text-sm lg:text-xs py-6 lg:py-3"
              >
                Load more properties
                {pagination.nextPage < pagination.totalPages}
              </Button>
            </div>
          )}
          <div className="h-[200px] w-full flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
} 