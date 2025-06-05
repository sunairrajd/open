export interface Property {
  YoutubeLink: string;
  YoutubeID: string;
  Price: number;
  Location: string;
  PropertyType: string;
  'Area(Sqft)': number;
  LastUpdated: string;
  ThumbnailLink?: string;
  Coordinates: string;
}

declare global {
  interface Window {
    showProperty: (property: Property) => void;
  }
} 