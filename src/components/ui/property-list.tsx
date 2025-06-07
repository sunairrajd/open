'use client';

import { Property } from "@/app/map/types";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

const formatPriceInCrores = (price: number) => {
  const crores = (price / 10000000).toFixed(2);
  return `₹${crores}Cr`;
};

export function PropertyList({ properties, onPropertyClick }: PropertyListProps) {
  return (
    <Card className="fixed lg:right-4 lg:top-20 lg:w-[400px] lg:bottom-4 lg:h-auto 
                    fixed bottom-0 left-0 right-0 h-[40vh] lg:h-[calc(100vh-6rem)]
                    bg-white/80 backdrop-blur-sm shadow-lg z-[998]">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Properties in View</h2>
          <span className="text-sm text-muted-foreground">{properties.length} found</span>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-10rem)] pr-4">
          <div className="space-y-4">
            {properties.map((property, index) => (
              <div
                key={`${property.Location}-${index}`}
                className="flex gap-4 p-3 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
                onClick={() => onPropertyClick(property)}
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 