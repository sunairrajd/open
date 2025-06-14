export interface Property {
  youtube_id: string;
  cleaned_location: string;
  latitude: string;
  longitude: string;
  property_type: string;
  typology: string;
  price_overall: string;
  sqft: number;
  amenities: string;
  car_park: string | null;
  floor: string | null;
  price_per_sqft: number;
  dimensions: string;
  direction: string;
  road_width: string;
  connectivity: string;
  nearby: string;
  contact_number: string;
  last_synced_date: string;
  possession_date: string;
  property_age: string;
  upload_date: string;
  Coordinates?: string; // For backward compatibility
}

declare global {
  interface Window {
    showProperty: (property: Property) => void;
  }
} 