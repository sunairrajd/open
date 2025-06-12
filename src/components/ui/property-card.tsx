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

const formatPriceInCrores = (price: number) => {
  const crores = (price / 10000000).toFixed(2);
  return `₹${crores}Cr`;
};

const formatPricePerSqft = (price: number, area: number) => {
  return `₹${Math.round(price / area).toLocaleString('en-IN')}/sqft`;
};

export function PropertyCard({ property, onClose }: PropertyCardProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <Card className="gap-2 fixed lg:left-[460px] lg:top-20 pt-0 lg:w-[240px] lg:h-[calc(100vh-7rem)] 
                     fixed bottom-0 left-0 right-0 h-[60vh] 
                     shadow-lg z-[9999] bg-white overflow-auto">
      <div className="sticky top-0 right-0 p-2 flex justify-end bg-white z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader className="relative px-4 py-0 gap-0">
        <CardTitle className="text-base font-bold mb-1 lg:text-sm md:text-lg">
          {formatPriceInCrores(property.Price)} <span className="font-regular">({property.PropertyType}) </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
           {property['Area(Sqft)']} sqft · {property.Location}
        </p>
        
      </CardHeader>
      
      <CardContent className="space-y-3 px- mt-2">
        {/* Main Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Area</h3>
            <p className="text-xs">{property['Area(Sqft)']} sqft</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Price per sqft</h3>
            <p className="text-xs">{formatPricePerSqft(property.Price, property['Area(Sqft)'])}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Possession</h3>
            <p className="text-xs">Ready to move</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Property Age</h3>
            <p className="text-xs">2 years</p>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Dimensions</h3>
          <div className="">
            <p className="text-xs">30ft x 40ft</p>
            
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Car Parking</h3>
            <p className="text-xs">2 covered</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Floor</h3>
            <p className="text-xs">3 of 8</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Direction</h3>
            <p className="text-xs">North East</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Road Width</h3>
            <p className="text-xs">30 ft</p>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Amenities</h3>
          <div className="flex flex-wrap gap-1">
            {['Swimming Pool', 'Gym', 'Club House', 'Children\'s Play Area', 'Security'].map((amenity) => (
              <span key={amenity} className="px-2 py-1 bg-accent rounded-md text-xs">
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Connectivity */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Connectivity</h3>
          <div className="space-y-1">
            <p className="text-xs">Metro Station - 1.2 km</p>
            <p className="text-xs">Bus Stop - 0.5 km</p>
            <p className="text-xs">Railway Station - 3 km</p>
          </div>
        </div>

        {/* Nearby */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Nearby</h3>
          <div className="space-y-1">
            <p className="text-xs">Schools: DPS (1km), Ryan International (2km)</p>
            <p className="text-xs">Hospitals: Apollo (1.5km), Fortis (3km)</p>
            <p className="text-xs">Shopping: Central Mall (1km), City Center (2km)</p>
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
                <p className="text-xs">Owner: John Doe</p>
                <p className="text-xs">Phone: +91 98765 43210</p>
                <p className="text-xs">Email: john.doe@example.com</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 