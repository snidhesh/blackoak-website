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

  // Pricing
  price: number;
  localPrice: number;
  localCurrency: string;

  // Property details
  developer: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
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
}
