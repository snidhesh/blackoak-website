import type { Project } from '@/types/project';
import type { Neighbourhood } from '@/types/neighbourhood';
import type { CareerJob } from '@/types/career';
import type { NewsItem } from '@/types/news';
import type { TeamMember } from '@/types/team';
import type { NavigationItem } from '@/types/navigation';
import type { FooterData } from '@/types/footer';

import navigationData from '@/content/navigation.json';
import footerData from '@/content/footer.json';
import projectsData from '@/content/projects.json';
import neighbourhoodsData from '@/content/neighbourhoods.json';
import teamData from '@/content/team.json';
import careersData from '@/content/careers.json';
import newsData from '@/content/news.json';

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

// Run integrity checks on import
validateSlugs(projectsData as Project[], 'projects');
validateSlugs(neighbourhoodsData as Neighbourhood[], 'neighbourhoods');
validateSlugs(careersData as CareerJob[], 'careers');
validateSlugs(newsData as NewsItem[], 'news');

// Cross-reference validation: project neighbourhood references
const validNeighbourhoodSlugs = new Set((neighbourhoodsData as Neighbourhood[]).map(n => n.slug));
for (const project of projectsData as Project[]) {
  if (project.neighbourhood && !validNeighbourhoodSlugs.has(project.neighbourhood)) {
    console.warn(`[content] Project "${project.slug}" references unknown neighbourhood: "${project.neighbourhood}"`);
  }
}

// Typed getters
export function getNavigation(): NavigationItem[] {
  return navigationData as NavigationItem[];
}

export function getFooter(): FooterData {
  return footerData as unknown as FooterData;
}

export function getProjects(): Project[] {
  return projectsData as Project[];
}

export function getProjectBySlug(slug: string): Project | undefined {
  return (projectsData as Project[]).find(p => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return (projectsData as Project[]).filter(p => p.featured);
}

export function getNeighbourhoods(): Neighbourhood[] {
  return neighbourhoodsData as Neighbourhood[];
}

export function getNeighbourhoodBySlug(slug: string): Neighbourhood | undefined {
  return (neighbourhoodsData as Neighbourhood[]).find(n => n.slug === slug);
}

export function getTeam(): TeamMember[] {
  return teamData as TeamMember[];
}

export function getCareers(): CareerJob[] {
  return careersData as CareerJob[];
}

export function getCareerBySlug(slug: string): CareerJob | undefined {
  return (careersData as CareerJob[]).find(c => c.slug === slug);
}

export function getNews(): NewsItem[] {
  return newsData as NewsItem[];
}

export function getNewsBySlug(slug: string): NewsItem | undefined {
  return (newsData as NewsItem[]).find(n => n.slug === slug);
}

export function getProjectsByNeighbourhood(neighbourhoodSlug: string): Project[] {
  return (projectsData as Project[]).filter(p => p.neighbourhood === neighbourhoodSlug);
}
