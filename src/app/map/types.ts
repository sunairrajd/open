export interface Property {
  id: string;
  youtube_id: string;
  price_overall: string;
  property_type: string;
  sqft: number;
  cleaned_location: string;
  latitude: string;
  longitude: string;
  amenities: string;
  connectivity: string;
  nearby: string;
  dimensions: string;
  car_park: string;
  floor: string;
  direction: string;
  road_width: string;
  possession_date: string;
  property_age: string;
  contact_number: string;
  upload_date: string;
  video_type: 'S' | 'F';  // 'S' for Short (portrait), 'F' for Full (landscape)
  typology: string;
  price_per_sqft: number;
  Coordinates?: string; // For backward compatibility
}

declare global {
  interface Window {
    showProperty: (property: Property) => void;
  }
} 