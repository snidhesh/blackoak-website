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

// Lightweight projection for list/grid views — excludes heavy fields
// (gallery, descriptions, floorPlans, amenities, agent, location) so the
// projects listing doesn't serialize ~1000 full objects into the client payload.
export interface ProjectListItem {
  slug: string;
  name: string;
  mainImage: string;
  price: number;
  currency: string;
  developer: string;
  neighbourhood: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  offering?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  nameFr?: string;
  nameAr?: string;
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
  descriptionFr?: string;
  descriptionAr?: string;
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
