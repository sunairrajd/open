'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Property } from "@/app/map/types";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  onClose: () => void;
}

const formatPriceInCrores = (price: string) => {
  const crores = (Number(price) / 10000000).toFixed(2);
  return `₹${crores}Cr`;
};

const formatPricePerSqft = (price: string, area: number) => {
  return `₹${Math.round(Number(price) / area).toLocaleString('en-IN')}/sqft`;
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

export function PropertyCard({ property, onClose }: PropertyCardProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <Card className="gap-2 fixed lg:left-[460px] lg:top-20 pt-0 lg:w-[240px] lg:h-[calc(100vh-7rem)] 
                     fixed bottom-0 left-0 right-0 h-[100dvh] 
                     shadow-lg z-[9999] bg-white overflow-auto scrollbar-hide lg:pt-0 pt-safe">
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
        @supports(padding: max(0px)) {
          .pt-safe {
            padding-top: max(0px, env(safe-area-inset-top));
          }
        }
      `}</style>
      <div className="sticky top-0 right-0 p-2 flex justify-end bg-white z-[11] mt-safe">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Video Section */}
      <div className="bg-white px-4 py-0">
        <div className={`relative h-full mx-auto ${
          property.video_type === 'S' 
            ? 'lg:w-full w-[70%] aspect-[9/16]' 
            : 'w-full aspect-video'
        }`}>
          <iframe
            src={`https://www.youtube.com/embed/${property.youtube_id}?autoplay=1&mute=0`}
            className="absolute inset-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
            allowFullScreen
          />
        </div>
      </div>

      <CardHeader className="relative px-4 py-0 gap-0 mt-4">
        <CardTitle className="text-base mb-1 lg:text-sm md:text-lg pt-2">
          

          {Number(property.price_overall) === 0 ? (
            <>
              <span className="font-regular font-bold ">Price on request</span>
              <span className="!font-regular "> ({property.property_type})</span>
            </>
          ) : (
            <>
              {formatPriceInCrores(property.price_overall)} <span className="font-regular">({property.property_type})</span>
            </>
          )}
        </CardTitle >

        <div className="flex flex-col ">
          <p className="text-xs text-base text-muted-foreground">
            {property.sqft} sqft · {property.cleaned_location}
          </p>
         
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 px-4 mt-2">
        {/* Main Details */}
        <div className="space-y-3">
          {/* <div>
            <h3 className="text-xs font-medium text-muted-foreground">Area</h3>
            <p className="text-xs">{property.sqft} sqft</p>
          </div> */}

          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Property Type</h3>
            {formatTypology(property.typology) && (
            <p className="text-xs ">
              {formatTypology(property.typology)}
            </p>
          )}
          </div>

          

          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Price per sqft</h3>
            <p className="text-xs">{formatPricePerSqft(property.price_overall, property.sqft)}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Possession</h3>
            <p className="text-xs">{property.possession_date === 'NA' ? 'Ready to move' : property.possession_date}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Property Age</h3>
            <p className="text-xs">{property.property_age === 'NA' ? 'N/A' : `${property.property_age} years`}</p>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Dimensions</h3>
          <div className="">
            <p className="text-xs">{property.dimensions}</p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Car Parking</h3>
            <p className="text-xs">{property.car_park || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Floor</h3>
            <p className="text-xs">{property.floor || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Direction</h3>
            <p className="text-xs">{property.direction}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Road Width</h3>
            <p className="text-xs">{property.road_width}</p>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Amenities</h3>
          <div className="flex flex-wrap gap-1">
            {property.amenities && property.amenities !== 'NA' ? (
              property.amenities.split(', ').map((amenity) => (
                <span key={amenity} className="px-2 py-1 bg-accent rounded-md text-xs">
                  {amenity}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No amenities listed</span>
            )}
          </div>
        </div>

        {/* Connectivity */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Connectivity</h3>
          <div className="space-y-1">
            {property.connectivity && property.connectivity !== 'NA' ? (
              property.connectivity.split(', ').map((item, index) => (
                <p key={index} className="text-xs">{item}</p>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No connectivity information available</p>
            )}
          </div>
        </div>

        {/* Nearby */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Nearby</h3>
          <div className="space-y-1">
            {property.nearby && property.nearby !== 'NA' ? (
              property.nearby.split(', ').map((item, index) => (
                <p key={index} className="text-xs">{item}</p>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No nearby information available</p>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-accent/10 rounded-lg pt-4">
          {!showContact ? (
            <Button 
              variant="default" 
              className="w-full text-white text-xs transition-colors"
              style={{ 
                backgroundColor: 'var(--pinkbrand)'
              }}
              onClick={() => setShowContact(true)}
            >
              View Contact Details
            </Button>
          ) : (
            <>
              <h3 className="text-xs font-medium mb-2">Contact Details</h3>
              <div className="space-y-1">
                <p className="text-xs">Phone: {property.contact_number}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 