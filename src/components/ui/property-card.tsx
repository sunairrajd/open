'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Play } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import type { Property } from "@/app/map/types";

interface PropertyCardProps {
  property: Property;
  onClose: () => void;
}

const formatPriceInCrores = (price: number) => {
  const crores = (price / 10000000).toFixed(2);
  return `₹${crores}Cr`;
};

export function PropertyCard({ property, onClose }: PropertyCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Get high quality thumbnail URL
  const thumbnailUrl = property.YoutubeID 
    ? thumbnailError 
      ? `https://img.youtube.com/vi/${property.YoutubeID}/hqdefault.jpg`
      : `https://img.youtube.com/vi/${property.YoutubeID}/maxresdefault.jpg`
    : property.ThumbnailLink;

  return (
    <Card className="fixed right-4 top-20 w-[400px] shadow-lg z-[9999] bg-white">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl font-bold">
          {formatPriceInCrores(property.Price)}
        </CardTitle>
        <CardDescription className="text-base">
          {property.PropertyType} · {property['Area(Sqft)']} sqft
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Video/Image */}
        <div className="aspect-video w-full overflow-hidden rounded-md relative">
          {isPlaying && property.YoutubeID ? (
            <iframe
              src={`https://www.youtube.com/embed/${property.YoutubeID}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="relative group cursor-pointer" onClick={() => setIsPlaying(true)}>
              <div className="relative aspect-video">
                <Image
                  src={thumbnailUrl}
                  alt={`${property.PropertyType} at ${property.Location}`}
                  fill
                  className="object-cover"
                  onError={() => {
                    if (!thumbnailError) {
                      setThumbnailError(true);
                    }
                  }}
                  sizes="(max-width: 400px) 100vw, 400px"
                  priority
                />
              </div>
              {property.YoutubeID && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <h3 className="font-semibold mb-1">Location</h3>
          <p className="text-muted-foreground">{property.Location}</p>
        </div>

        {/* Last Updated */}
        <div>
          <h3 className="font-semibold mb-1">Last Updated</h3>
          <p className="text-muted-foreground">
            {new Date(property.LastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {!isPlaying && property.YoutubeID && (
          <Button 
            className="w-full"
            onClick={() => setIsPlaying(true)}
          >
            Watch Video Tour
          </Button>
        )}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            // Copy location to clipboard
            navigator.clipboard.writeText(property.Location);
          }}
        >
          Copy Address
        </Button>
      </CardFooter>
    </Card>
  );
} 