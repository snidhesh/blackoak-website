export interface CrmAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  profileImage: string;
  position: string;
  brn: string;
}

export interface CrmListing {
  id: string;
  reference: string;
  titleEn: string;
  descriptionEn: string;
  type: string;
  offering: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnishingType: string;
  parkingSlots: number;
  developer: string;
  projectName: string;
  locationBuilding: string;
  locationCommunity: string;
  address: string;
  amenities: string[];
  images: string[];
  availableFrom: string;
  agent: CrmAgent | null;
}

export interface CrmListResponse {
  data: CrmListing[];
  page: number;
  limit: number;
  total: number;
}
