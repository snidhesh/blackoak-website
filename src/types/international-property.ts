export type InternationalRegionSlug = 'europe' | 'asia' | 'americas';
export type InternationalOffering = 'sale' | 'rent';

export interface InternationalCountry {
  slug: string;
  name: string;
  countryCode: string;
  region: InternationalRegionSlug;
  heroImage: string;
  thumbnail: string;
  description: string;
  /** One-line marketing blurb used in compact UIs (homepage market stack). */
  shortFocus?: string;
  whyInvest: {
    title: string;
    points: { title: string; description: string }[];
  };
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
}

export interface InternationalRegion {
  id: string;
  slug: InternationalRegionSlug;
  name: string;
  description: string;
  image: string;
  propertyCount: number;
}

export interface UnitType {
  name: string;
  /** Category used to group units in the residences accordion (e.g. "beach", "water") */
  category?: string;
  bedrooms: number;
  area: number | null;
  areaUnit: string;
  price: number | null;
  localPrice?: number | null;
  priceOnRequest?: boolean;
  /** Optional hero image for the unit card */
  image?: string;
  /** Image rendering of the floor plan, shown in the modal */
  floorPlanImageUrl?: string;
  /** Original PDF — kept for download/print */
  floorPlanUrl?: string;
}

export interface InternationalProperty {
  // Identity
  id: string;
  slug: string;
  name: string;

  // Location
  country: string;
  countryCode: string;
  region: InternationalRegionSlug;
  city: string;
  address: string;
  coordinates: { lat: number; lng: number };

  // Pricing — single value for single-unit listings; "from" value for multi-unit developments
  price: number;
  priceTo?: number;
  localPrice: number;
  localPriceTo?: number;
  localCurrency: string;

  // Property details — single values are also "from / lowest" for multi-unit developments
  developer: string;
  propertyType: string;
  bedrooms: number;
  bedroomsTo?: number;
  bathrooms: number;
  area: number;
  areaTo?: number;
  areaUnit: string;
  offering: InternationalOffering;
  status: 'available' | 'sold' | 'coming-soon';
  featured: boolean;

  // Content
  description: string;
  mainImage: string;
  gallery: string[];
  floorPlans: { name: string; image: string }[];
  amenities: string[];
  unitTypes?: UnitType[];
}
