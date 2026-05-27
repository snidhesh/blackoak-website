import type { CrmListing } from '@/types/crm';
import type { Project } from '@/types/project';
import type { Locale } from '@/i18n/config';
import { slugify } from '@/lib/utils';

const CRM_API_BASE_URL = process.env.CRM_API_BASE_URL ?? '';

// The CRM returns some images as multi-MB base64 data URIs that the app
// discards anyway (see resolveImageUrl). Strip them before storing a snapshot
// so it stays small (~2MB instead of ~50MB).
export function sanitizeListing(listing: CrmListing): CrmListing {
  const images = Array.isArray(listing.images)
    ? listing.images.filter((img) => typeof img === 'string' && !img.startsWith('data:'))
    : [];
  const agent =
    listing.agent && listing.agent.profileImage?.startsWith?.('data:')
      ? { ...listing.agent, profileImage: '' }
      : listing.agent;
  return { ...listing, images, agent };
}

const COMMUNITY_TO_SLUG: Record<string, string> = {
  // Neighbourhood pages
  'emirates hills': 'emirates-hills',
  'palm jumeirah': 'palm-jumeirah',
  'dubai hills estate': 'dubai-hills-estate',
  'al barari': 'al-barari',
  'downtown dubai': 'downtown-dubai',
  'difc': 'difc',
  'jumeirah golf estates': 'jumeirah-golf-estates',
  'jumeirah islands': 'jumeirah-islands',
  'dubai marina': 'dubai-marina',
  'mohammed bin rashid city': 'mohammed-bin-rashid-city',
  'city walk': 'city-walk',
  'business bay': 'business-bay',
  'bluewaters island': 'bluewaters-island',
  'bluewaters': 'bluewaters-island',
  // CRM communities without dedicated neighbourhood pages
  'al furjan': 'al-furjan',
  'al satwa': 'al-satwa',
  'al wasl': 'al-wasl',
  'arabian ranches': 'arabian-ranches',
  'city of arabia': 'city-of-arabia',
  'creek beach': 'creek-beach',
  'damac hills': 'damac-hills',
  'district 11': 'district-11',
  'dubai creek harbour (the lagoons)': 'dubai-creek-harbour',
  'dubai harbour': 'dubai-harbour',
  'dubai investment park (dip)': 'dubai-investment-park',
  'dubai land': 'dubai-land',
  'dubai science park': 'dubai-science-park',
  'dubai south (dubai world central)': 'dubai-south',
  'dubai sports city': 'dubai-sports-city',
  'dubai waterfront': 'dubai-waterfront',
  'emaar beachfront': 'emaar-beachfront',
  'ghaf woods': 'ghaf-woods',
  'greens': 'greens',
  'jumeirah': 'jumeirah',
  'jumeirah 2': 'jumeirah-2',
  'jumeirah beach residence': 'jumeirah-beach-residence',
  'jumeirah lake towers': 'jumeirah-lake-towers',
  'jumeirah village circle': 'jumeirah-village-circle',
  'meydan one': 'meydan-one',
  'mina al arab': 'mina-al-arab',
  'motor city': 'motor-city',
  'nad al sheba': 'nad-al-sheba',
  'remraam': 'remraam',
  'sobha hartland': 'sobha-hartland',
  'the lakes': 'the-lakes',
  'tilal city': 'tilal-city',
  'wasl gate': 'wasl-gate',
  'zabeel 2': 'zabeel-2',
};

export function resolveImageUrl(url: string | undefined | null): string {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // The CRM sometimes returns inline base64 data URIs. Prefixing them with the
  // base URL produced broken src values that next/image expanded into multi-MB
  // srcset entries (a single one reached ~29MB), so fall back to a placeholder.
  if (url.startsWith('data:')) return '/images/placeholder.jpg';
  return `${CRM_API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function mapCommunityToNeighbourhood(community: string): string {
  if (!community) return '';
  const key = community.toLowerCase().trim();

  if (COMMUNITY_TO_SLUG[key]) return COMMUNITY_TO_SLUG[key];

  const slugified = slugify(community);
  console.warn(
    `[crm-transform] Unknown community "${community}" → slugified to "${slugified}". Add to COMMUNITY_TO_SLUG if a neighbourhood page exists.`
  );
  return slugified;
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function generateListingSlug(listing: CrmListing): string {
  if (listing.titleEn) return slugify(listing.titleEn);
  return slugify(listing.reference || listing.id);
}

export function transformListing(listing: CrmListing): Project {
  const images = listing.images ?? [];
  const address = [listing.address, listing.locationCommunity, 'Dubai']
    .filter(Boolean)
    .join(', ');

  const isComingSoon =
    listing.availableFrom && new Date(listing.availableFrom) > new Date();

  return {
    id: listing.id,
    crmId: listing.id,
    slug: generateListingSlug(listing),
    name: listing.titleEn || listing.reference || 'Untitled',
    nameFr: listing.titleFr || undefined,
    nameAr: listing.titleAr || undefined,
    developer: listing.developer || '',
    neighbourhood: mapCommunityToNeighbourhood(listing.locationCommunity),
    price: listing.price ?? 0,
    currency: 'AED',
    propertyType: capitalize(listing.type),
    bedrooms: listing.bedrooms ?? 0,
    bathrooms: listing.bathrooms ?? 0,
    area: listing.area ?? 0,
    areaUnit: 'Sq.Ft.',
    mainImage: resolveImageUrl(images[0]),
    gallery: images.slice(1).map(resolveImageUrl),
    description: listing.descriptionEn || '',
    descriptionFr: listing.descriptionFr || undefined,
    descriptionAr: listing.descriptionAr || undefined,
    floorPlans: [],
    amenities: (listing.amenities ?? []).map(capitalize),
    location: {
      address,
      lat: 0,
      lng: 0,
    },
    featured: false,
    status: isComingSoon ? 'coming-soon' : 'available',
    offering: listing.offering || '',
    reference: listing.reference || '',
    furnishingType: listing.furnishingType || '',
    parkingSlots: listing.parkingSlots ?? 0,
    projectName: listing.projectName || '',
    locationBuilding: listing.locationBuilding || '',
    locationCommunity: listing.locationCommunity || '',
    availableFrom: listing.availableFrom || '',
    agent: listing.agent
      ? {
          id: listing.agent.id,
          name: listing.agent.name,
          email: listing.agent.email,
          phone: listing.agent.phone,
          whatsapp: listing.agent.whatsapp,
          profileImage: resolveImageUrl(listing.agent.profileImage),
          position: listing.agent.position,
          brn: listing.agent.brn,
        }
      : null,
  };
}

export function getProjectName(project: Project, locale: Locale): string {
  if (locale === 'ar' && project.nameAr) return project.nameAr;
  if (locale === 'fr' && project.nameFr) return project.nameFr;
  return project.name;
}

export function getProjectDescription(project: Project, locale: Locale): string {
  if (locale === 'ar' && project.descriptionAr) return project.descriptionAr;
  if (locale === 'fr' && project.descriptionFr) return project.descriptionFr;
  return project.description;
}

export function deduplicateSlugs(projects: Project[]): Project[] {
  const slugCount = new Map<string, number>();

  for (const p of projects) {
    slugCount.set(p.slug, (slugCount.get(p.slug) ?? 0) + 1);
  }

  const seen = new Map<string, number>();
  return projects.map((p) => {
    const count = slugCount.get(p.slug) ?? 1;
    if (count <= 1) return p;

    const idx = seen.get(p.slug) ?? 0;
    seen.set(p.slug, idx + 1);

    if (idx === 0) return p;

    return {
      ...p,
      slug: `${p.slug}-${p.crmId?.slice(0, 8) ?? idx}`,
    };
  });
}
