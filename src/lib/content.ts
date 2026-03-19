import { cache } from 'react';
import type { Project } from '@/types/project';
import type { Neighbourhood } from '@/types/neighbourhood';
import type { CareerJob } from '@/types/career';
import type { NewsItem } from '@/types/news';
import type { TeamMember } from '@/types/team';
import type { NavigationItem } from '@/types/navigation';
import type { FooterData } from '@/types/footer';

import navigationData from '@/content/navigation.json';
import footerData from '@/content/footer.json';
import neighbourhoodsData from '@/content/neighbourhoods.json';
import teamData from '@/content/team.json';
import careersData from '@/content/careers.json';
import newsData from '@/content/news.json';

import { fetchAllListings } from '@/lib/crm';
import { transformListing, deduplicateSlugs } from '@/lib/crm-transform';

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

// Run integrity checks on static data
validateSlugs(neighbourhoodsData as Neighbourhood[], 'neighbourhoods');
validateSlugs(careersData as CareerJob[], 'careers');
validateSlugs(newsData as NewsItem[], 'news');

// --- CRM-backed project functions (async) ---

async function _getProjects(): Promise<Project[]> {
  try {
    const listings = await fetchAllListings();
    const projects = deduplicateSlugs(listings.map(transformListing));

    // Post-transform neighbourhood validation
    const validNeighbourhoodSlugs = new Set(
      (neighbourhoodsData as Neighbourhood[]).map((n) => n.slug)
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

// --- Static data functions (sync, unchanged) ---

export function getNavigation(): NavigationItem[] {
  return navigationData as NavigationItem[];
}

export function getFooter(): FooterData {
  return footerData as unknown as FooterData;
}

export function getNeighbourhoods(): Neighbourhood[] {
  return neighbourhoodsData as Neighbourhood[];
}

export function getNeighbourhoodBySlug(slug: string): Neighbourhood | undefined {
  return (neighbourhoodsData as Neighbourhood[]).find((n) => n.slug === slug);
}

export function getTeam(): TeamMember[] {
  return teamData as TeamMember[];
}

export function getCareers(): CareerJob[] {
  return careersData as CareerJob[];
}

export function getCareerBySlug(slug: string): CareerJob | undefined {
  return (careersData as CareerJob[]).find((c) => c.slug === slug);
}

export function getNews(): NewsItem[] {
  return newsData as NewsItem[];
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return (newsData as NewsItem[]).find((n) => n.slug === slug);
}
