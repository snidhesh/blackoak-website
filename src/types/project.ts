export interface Project {
  id: string;
  slug: string;
  name: string;
  developer: string;
  neighbourhood: string;
  price: number;
  currency: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  mainImage: string;
  gallery: string[];
  description: string;
  floorPlans: { name: string; image: string }[];
  amenities: string[];
  location: { lat: number; lng: number; address: string };
  featured: boolean;
  status: 'available' | 'sold' | 'coming-soon';
}
