export interface ProjectAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  profileImage: string;
  position: string;
  brn: string;
}

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
  // CRM fields
  crmId?: string;
  offering?: string;
  reference?: string;
  furnishingType?: string;
  parkingSlots?: number;
  projectName?: string;
  locationBuilding?: string;
  locationCommunity?: string;
  availableFrom?: string;
  agent?: ProjectAgent | null;
}
