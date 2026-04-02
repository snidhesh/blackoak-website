import { cache } from 'react';
import type { Project } from '@/types/project';
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

import { fetchAllListings } from '@/lib/crm';
import { transformListing, deduplicateSlugs } from '@/lib/crm-transform';

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

// --- CRM-backed project functions (async) ---

async function _getProjects(): Promise<Project[]> {
  try {
    const listings = await fetchAllListings();
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

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  return [...projects].sort((a, b) => b.price - a.price).slice(0, 8);
}

export async function getProjectsByNeighbourhood(neighbourhoodSlug: string): Promise<Project[]> {
  const projects = await getProjects();
  return projects.filter((p) => p.neighbourhood === neighbourhoodSlug);
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
  return getContent('team', locale) as TeamMember[];
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
