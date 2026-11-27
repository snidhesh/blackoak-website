import { cache } from 'react';
import type { Project, ProjectListItem } from '@/types/project';
import type { Neighbourhood } from '@/types/neighbourhood';
import type { CareerJob } from '@/types/career';
import type { NewsItem } from '@/types/news';
import type { TeamMember } from '@/types/team';
import type { NavigationItem } from '@/types/navigation';
import type { FooterData } from '@/types/footer';
import type { Locale } from '@/i18n/config';

// Locale-specific static imports
import navigationEn from '@/content/en/navigation.json';
import navigationFr from '@/content/fr/navigation.json';
import footerEn from '@/content/en/footer.json';
import footerFr from '@/content/fr/footer.json';
import neighbourhoodsEn from '@/content/en/neighbourhoods.json';
import neighbourhoodsFr from '@/content/fr/neighbourhoods.json';
import teamEn from '@/content/en/team.json';
import teamFr from '@/content/fr/team.json';
import careersEn from '@/content/en/careers.json';
import careersFr from '@/content/fr/careers.json';
import newsEn from '@/content/en/news.json';
import newsFr from '@/content/fr/news.json';
import homepageEn from '@/content/en/homepage.json';
import homepageFr from '@/content/fr/homepage.json';
import splashEn from '@/content/en/splash.json';
import splashFr from '@/content/fr/splash.json';
import investorsEn from '@/content/en/investors.json';
import investorsFr from '@/content/fr/investors.json';
import buyersEn from '@/content/en/buyers.json';
import buyersFr from '@/content/fr/buyers.json';
import contactEn from '@/content/en/contact.json';
import contactFr from '@/content/fr/contact.json';
import privacyPolicyEn from '@/content/en/privacy-policy.json';
import privacyPolicyFr from '@/content/fr/privacy-policy.json';
import termsOfServiceEn from '@/content/en/terms-of-service.json';
import termsOfServiceFr from '@/content/fr/terms-of-service.json';
import disclaimerEn from '@/content/en/disclaimer.json';
import disclaimerFr from '@/content/fr/disclaimer.json';
import navigationAr from '@/content/ar/navigation.json';
import footerAr from '@/content/ar/footer.json';
import neighbourhoodsAr from '@/content/ar/neighbourhoods.json';
import teamAr from '@/content/ar/team.json';
import careersAr from '@/content/ar/careers.json';
import newsAr from '@/content/ar/news.json';
import homepageAr from '@/content/ar/homepage.json';
import splashAr from '@/content/ar/splash.json';
import investorsAr from '@/content/ar/investors.json';
import buyersAr from '@/content/ar/buyers.json';
import contactAr from '@/content/ar/contact.json';
import privacyPolicyAr from '@/content/ar/privacy-policy.json';
import termsOfServiceAr from '@/content/ar/terms-of-service.json';
import disclaimerAr from '@/content/ar/disclaimer.json';
import internationalPropertiesEn from '@/content/en/international-properties.json';
import internationalPropertiesFr from '@/content/fr/international-properties.json';
import internationalPropertiesAr from '@/content/ar/international-properties.json';
import marketIntelligenceEn from '@/content/en/market-intelligence.json';
import marketIntelligenceFr from '@/content/fr/market-intelligence.json';
import marketIntelligenceAr from '@/content/ar/market-intelligence.json';

import type { CrmListing } from '@/types/crm';
import listingsSnapshot from '@/data/listings-snapshot.json';
import { transformListing, deduplicateSlugs, listingShortId } from '@/lib/crm-transform';

// Locale content maps
const contentMap = {
  navigation: { en: navigationEn, fr: navigationFr, ar: navigationAr },
  footer: { en: footerEn, fr: footerFr, ar: footerAr },
  neighbourhoods: { en: neighbourhoodsEn, fr: neighbourhoodsFr, ar: neighbourhoodsAr },
  team: { en: teamEn, fr: teamFr, ar: teamAr },
  careers: { en: careersEn, fr: careersFr, ar: careersAr },
  news: { en: newsEn, fr: newsFr, ar: newsAr },
  homepage: { en: homepageEn, fr: homepageFr, ar: homepageAr },
  splash: { en: splashEn, fr: splashFr, ar: splashAr },
  investors: { en: investorsEn, fr: investorsFr, ar: investorsAr },
  buyers: { en: buyersEn, fr: buyersFr, ar: buyersAr },
  contact: { en: contactEn, fr: contactFr, ar: contactAr },
  privacyPolicy: { en: privacyPolicyEn, fr: privacyPolicyFr, ar: privacyPolicyAr },
  termsOfService: { en: termsOfServiceEn, fr: termsOfServiceFr, ar: termsOfServiceAr },
  disclaimer: { en: disclaimerEn, fr: disclaimerFr, ar: disclaimerAr },
  internationalProperties: { en: internationalPropertiesEn, fr: internationalPropertiesFr, ar: internationalPropertiesAr },
  marketIntelligence: { en: marketIntelligenceEn, fr: marketIntelligenceFr, ar: marketIntelligenceAr },
} as const;

function getContent<K extends keyof typeof contentMap>(key: K, locale: Locale = 'en'): (typeof contentMap)[K]['en'] {
  return contentMap[key][locale] ?? contentMap[key].en;
}

// Slug validation
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSlugs<T extends { slug: string }>(items: T[], type: string): void {
  const slugs = new Set<string>();
  for (const item of items) {
    if (!SLUG_REGEX.test(item.slug)) {
      throw new Error(`[content] Invalid slug format for ${type}: "${item.slug}"`);
    }
    if (slugs.has(item.slug)) {
      throw new Error(`[content] Duplicate slug in ${type}: "${item.slug}"`);
    }
    slugs.add(item.slug);
  }
}

// Run integrity checks on English data (slugs are identical across locales)
validateSlugs(neighbourhoodsEn as Neighbourhood[], 'neighbourhoods');
validateSlugs(careersEn as CareerJob[], 'careers');
validateSlugs(newsEn as NewsItem[], 'news');
validateSlugs(
  (internationalPropertiesEn as { properties: { slug: string }[] }).properties,
  'international-properties'
);
validateSlugs(
  (internationalPropertiesEn as { countries: { slug: string }[] }).countries,
  'international-countries'
);

// Cross-slug collision check: country slugs vs property slugs
{
  const countrySlugs = new Set(
    (internationalPropertiesEn as { countries: { slug: string }[] }).countries.map((c) => c.slug)
  );
  const propertySlugs = (internationalPropertiesEn as { properties: { slug: string }[] }).properties.map((p) => p.slug);
  for (const ps of propertySlugs) {
    if (countrySlugs.has(ps)) {
      throw new Error(`[content] Slug collision: "${ps}" exists as both a country and a property`);
    }
  }
}

// --- CRM-backed project functions (async) ---

// Public URL of the snapshot in Vercel Blob (refreshed every 15 min by the
// GitHub Action). addRandomSuffix:false keeps this URL stable.
const SNAPSHOT_BLOB_URL =
  process.env.PROJECTS_SNAPSHOT_URL ??
  'https://w3lbfhke8nf2vtpc.public.blob.vercel-storage.com/listings-snapshot.json';

// How long one copy of the snapshot is reused before it is fetched again.
const SNAPSHOT_TTL_MS = 60_000;

// Last snapshot this server instance read successfully. Reused for
// SNAPSHOT_TTL_MS, and served if a later read fails, so a brief Blob outage
// does not drop the site back to the much older committed fallback.
let lastGoodSnapshot: { readAt: number; listings: CrmListing[] } | null = null;

// Reads the snapshot from Blob. Returns null only when there is no usable
// copy at all, in which case callers fall back to the committed snapshot —
// the CRM is never hit on the request path.
//
// The URL carries a one-minute bucket. Next's fetch cache serves a stale entry
// while it revalidates in the background, and silently refuses to store a
// response over 2 MB — so once the snapshot outgrew that limit, an old entry
// could never be replaced and kept being served as "the listings". With a new
// cache key every minute, a cached copy can never be more than a minute old,
// whatever the file's size.
async function readSnapshotFromBlob(): Promise<CrmListing[] | null> {
  const now = Date.now();
  if (lastGoodSnapshot && now - lastGoodSnapshot.readAt < SNAPSHOT_TTL_MS) {
    return lastGoodSnapshot.listings;
  }

  try {
    const url = new URL(SNAPSHOT_BLOB_URL);
    url.searchParams.set('v', String(Math.floor(now / SNAPSHOT_TTL_MS)));
    const res = await fetch(url, { next: { revalidate: SNAPSHOT_TTL_MS / 1000 } });
    if (!res.ok) {
      console.error(`[content] Blob snapshot read failed: HTTP ${res.status} ${res.statusText}`);
      return lastGoodSnapshot?.listings ?? null;
    }
    const listings = (await res.json()) as CrmListing[];
    if (!Array.isArray(listings) || listings.length === 0) {
      console.error('[content] Blob snapshot is empty or malformed, ignoring it');
      return lastGoodSnapshot?.listings ?? null;
    }
    lastGoodSnapshot = { readAt: now, listings };
    return listings;
  } catch (error) {
    console.error('[content] Blob snapshot read failed:', error);
    return lastGoodSnapshot?.listings ?? null;
  }
}

async function _getProjects(): Promise<Project[]> {
  try {
    let listings = await readSnapshotFromBlob();
    if (!listings) {
      console.error('[content] No Blob snapshot available, serving the committed fallback');
      listings = listingsSnapshot as unknown as CrmListing[];
    }
    const projects = deduplicateSlugs(listings.map(transformListing));

    // Post-transform neighbourhood validation
    const validNeighbourhoodSlugs = new Set(
      (neighbourhoodsEn as Neighbourhood[]).map((n) => n.slug)
    );
    for (const project of projects) {
      if (project.neighbourhood && !validNeighbourhoodSlugs.has(project.neighbourhood)) {
        console.warn(
          `[content] Project "${project.slug}" references unknown neighbourhood: "${project.neighbourhood}"`
        );
      }
    }

    return projects;
  } catch (error) {
    console.error('[content] Failed to fetch projects from CRM:', error);
    return [];
  }
}

// Deduplicated per server request — transform + dedup runs once
export const getProjects = cache(_getProjects);

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug);
}

/**
 * Finds the listing a URL slug refers to, including URLs that are no longer
 * the listing's current one. `isCanonical` is false when the caller should
 * redirect to `project.slug`.
 */
export async function resolveProjectSlug(
  slug: string
): Promise<{ project: Project; isCanonical: boolean } | undefined> {
  const projects = await getProjects();

  const exact = projects.find((p) => p.slug === slug);
  if (exact) return { project: exact, isCanonical: true };

  // The title was edited after this URL was shared: the id at the end still
  // identifies the listing.
  const shortId = slug.match(/-([a-z0-9]{8})$/)?.[1];
  if (shortId) {
    const byId = projects.find((p) => listingShortId(p.crmId ?? p.id) === shortId);
    if (byId) return { project: byId, isCanonical: false };
  }

  // A URL from before ids were part of every listing slug.
  const legacy = projects.find((p) => p.legacySlug === slug);
  if (legacy) return { project: legacy, isCanonical: false };

  return undefined;
}

/**
 * Listings to suggest under a listing ("You may also like"). Candidates share
 * the listing's offering (sale or rent); they are then ranked by how alike
 * they are: same community first, then property type, bedroom count and price.
 * Listings with a title already shown (the same unit type is often listed
 * several times) are skipped so the suggestions are not copies of each other.
 */
export async function getSimilarProjects(project: Project, limit = 3): Promise<Project[]> {
  const projects = await getProjects();
  const isRental = (p: Project) => p.offering === 'rent' || p.offering === 'yearly';

  const score = (p: Project): number => {
    let points = 0;
    if (p.locationCommunity && p.locationCommunity === project.locationCommunity) points += 4;
    else if (p.neighbourhood && p.neighbourhood === project.neighbourhood) points += 3;
    if (p.propertyType === project.propertyType) points += 2;
    const bedroomGap = Math.abs(p.bedrooms - project.bedrooms);
    if (bedroomGap === 0) points += 2;
    else if (bedroomGap === 1) points += 1;
    if (project.price > 0 && p.price > 0) {
      const priceGap = Math.abs(p.price - project.price) / project.price;
      if (priceGap <= 0.25) points += 2;
      else if (priceGap <= 0.5) points += 1;
    }
    return points;
  };

  const ranked = projects
    .filter((p) => p.slug !== project.slug && isRental(p) === isRental(project))
    .map((p) => ({ p, points: score(p), priceGap: Math.abs(p.price - project.price) }))
    .sort((a, b) => b.points - a.points || a.priceGap - b.priceGap || a.p.slug.localeCompare(b.p.slug));

  const picked: Project[] = [];
  const seenNames = new Set([project.name]);
  for (const { p } of ranked) {
    if (seenNames.has(p.name)) continue;
    seenNames.add(p.name);
    picked.push(p);
    if (picked.length === limit) break;
  }
  return picked;
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  return [...projects].sort((a, b) => b.price - a.price).slice(0, 8);
}

export async function getProjectsByNeighbourhood(neighbourhoodSlug: string): Promise<Project[]> {
  const projects = await getProjects();
  return projects.filter((p) => p.neighbourhood === neighbourhoodSlug);
}

export function toProjectListItem(p: Project): ProjectListItem {
  return {
    slug: p.slug,
    name: p.name,
    mainImage: p.mainImage,
    price: p.price,
    currency: p.currency,
    developer: p.developer,
    neighbourhood: p.neighbourhood,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    areaUnit: p.areaUnit,
    offering: p.offering,
  };
}

export async function getProjectListItems(): Promise<ProjectListItem[]> {
  const projects = await getProjects();
  return projects.map(toProjectListItem);
}

// --- Static data functions (locale-aware) ---

export function getNavigation(locale: Locale = 'en'): NavigationItem[] {
  return getContent('navigation', locale) as NavigationItem[];
}

export function getFooter(locale: Locale = 'en'): FooterData {
  return getContent('footer', locale) as unknown as FooterData;
}

export function getNeighbourhoods(locale: Locale = 'en'): Neighbourhood[] {
  return getContent('neighbourhoods', locale) as Neighbourhood[];
}

export function getNeighbourhoodBySlug(slug: string, locale: Locale = 'en'): Neighbourhood | undefined {
  return (getContent('neighbourhoods', locale) as Neighbourhood[]).find((n) => n.slug === slug);
}

export function getTeam(locale: Locale = 'en'): TeamMember[] {
  return (getContent('team', locale) as TeamMember[]).filter(
    (m) => !m.category.startsWith('_'),
  );
}

export function getCareers(locale: Locale = 'en'): CareerJob[] {
  return getContent('careers', locale) as CareerJob[];
}

export function getCareerBySlug(slug: string, locale: Locale = 'en'): CareerJob | undefined {
  return (getContent('careers', locale) as CareerJob[]).find((c) => c.slug === slug);
}

export function getNews(locale: Locale = 'en'): NewsItem[] {
  return getContent('news', locale) as NewsItem[];
}

export function getNewsBySlug(slug: string, locale: Locale = 'en'): NewsItem | undefined {
  return (getContent('news', locale) as NewsItem[]).find((n) => n.slug === slug);
}

// --- New content getters ---

export function getHomepage(locale: Locale = 'en') {
  return getContent('homepage', locale);
}

export function getSplash(locale: Locale = 'en') {
  return getContent('splash', locale);
}

export function getInvestors(locale: Locale = 'en') {
  return getContent('investors', locale);
}

export function getBuyers(locale: Locale = 'en') {
  return getContent('buyers', locale);
}

export function getMarketIntelligence(locale: Locale = 'en') {
  return getContent('marketIntelligence', locale);
}

export function getContact(locale: Locale = 'en') {
  return getContent('contact', locale);
}

export function getPrivacyPolicy(locale: Locale = 'en') {
  return getContent('privacyPolicy', locale);
}

export function getTermsOfService(locale: Locale = 'en') {
  return getContent('termsOfService', locale);
}

export function getDisclaimer(locale: Locale = 'en') {
  return getContent('disclaimer', locale);
}

// --- International Properties (static, locale-aware) ---

import type { InternationalProperty, InternationalRegion, InternationalRegionSlug, InternationalCountry } from '@/types/international-property';

export function getInternationalProperties(locale: Locale = 'en'): InternationalProperty[] {
  const data = getContent('internationalProperties', locale) as { properties: InternationalProperty[] };
  return data.properties;
}

export function getInternationalPropertyBySlug(slug: string, locale: Locale = 'en'): InternationalProperty | undefined {
  return getInternationalProperties(locale).find((p) => p.slug === slug);
}

export function getInternationalRegions(locale: Locale = 'en'): InternationalRegion[] {
  const data = getContent('internationalProperties', locale) as { regions: InternationalRegion[] };
  return data.regions;
}

export function getInternationalCountries(locale: Locale = 'en'): InternationalCountry[] {
  const data = getContent('internationalProperties', locale) as { countries: InternationalCountry[] };
  return data.countries;
}

export function getInternationalCountryBySlug(slug: string, locale: Locale = 'en'): InternationalCountry | undefined {
  return getInternationalCountries(locale).find((c) => c.slug === slug);
}

export function getInternationalCountryByCode(countryCode: string, locale: Locale = 'en'): InternationalCountry | undefined {
  return getInternationalCountries(locale).find((c) => c.countryCode === countryCode);
}

export function getInternationalPropertiesByCountry(countryCode: string, locale: Locale = 'en'): InternationalProperty[] {
  return getInternationalProperties(locale).filter((p) => p.countryCode === countryCode);
}

export function getInternationalPropertiesByRegion(regionSlug: InternationalRegionSlug, locale: Locale = 'en'): InternationalProperty[] {
  return getInternationalProperties(locale).filter((p) => p.region === regionSlug);
}

export function getFeaturedInternationalProperties(locale: Locale = 'en'): InternationalProperty[] {
  return getInternationalProperties(locale)
    .filter((p) => p.featured && p.status === 'available')
    .slice(0, 3);
}
