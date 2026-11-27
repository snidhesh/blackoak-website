'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { ProjectListItem } from '@/types/project';
import FilterBar, { type FilterState } from '@/components/sections/FilterBar';
import PropertyGrid from '@/components/sections/PropertyGrid';
import Pagination from '@/components/ui/Pagination';
import { PROJECTS_PER_PAGE } from '@/lib/constants';

interface ProjectsClientProps {
  projects: ProjectListItem[];
  neighbourhoodSlugs: string[];
  propertyTypes: string[];
  offerings: string[];
  /** Page of the unfiltered list this URL represents (1 for /projects/). */
  initialPage?: number;
}

const ITEMS_PER_PAGE = PROJECTS_PER_PAGE;

/** Path of a page of the unfiltered list; the locale prefix is added by Link. */
const pageHref = (page: number) => (page <= 1 ? '/projects/' : `/projects/page/${page}/`);

export default function ProjectsClient({
  projects,
  neighbourhoodSlugs,
  propertyTypes,
  offerings,
  initialPage = 1,
}: ProjectsClientProps) {
  const appliedRef = useRef(false);

  const [filters, setFilters] = useState<FilterState>({
    neighbourhoods: [],
    propertyType: '',
    bedrooms: '',
    priceRange: '',
    offering: '',
  });
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sort, setSort] = useState('most-recent');

  // Read ?location= from URL after hydration (useSearchParams unreliable on SSG)
  useEffect(() => {
    if (appliedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const location = params.get('location');
    if (location && neighbourhoodSlugs.includes(location)) {
      appliedRef.current = true;
      setFilters(prev => ({ ...prev, neighbourhoods: [location] }));
    }
  }, [neighbourhoodSlugs]);

  const filteredProjects = useMemo(() => {
    let result = projects.filter((p) => {
      if (filters.offering && p.offering !== filters.offering) return false;
      if (filters.neighbourhoods.length > 0 && !filters.neighbourhoods.includes(p.neighbourhood)) return false;
      if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
      if (filters.bedrooms) {
        const beds = parseInt(filters.bedrooms);
        if (beds === 4) {
          if (p.bedrooms < 4) return false;
        } else {
          if (p.bedrooms !== beds) return false;
        }
      }
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (p.price < min || p.price > max) return false;
      }
      return true;
    });

    if (sort === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [projects, filters, sort]);

  const isFiltered =
    sort !== 'most-recent' ||
    filters.neighbourhoods.length > 0 ||
    Boolean(filters.propertyType || filters.bedrooms || filters.priceRange || filters.offering);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-x-hidden">
        <FilterBar
          neighbourhoods={neighbourhoodSlugs}
          propertyTypes={propertyTypes}
          offerings={offerings}
          filters={filters}
          onFilterChange={handleFilterChange}
          onSortChange={setSort}
          sort={sort}
          resultCount={filteredProjects.length}
        />
      </div>

      {/* Property grid */}
      <div className="mt-8">
        <PropertyGrid projects={paginatedProjects} />
      </div>

      {/* With no filter or sort applied, page numbers are real links to
          /projects/page/N/ (crawlable, shareable, back button works). Once the
          visitor filters or sorts, the list no longer matches those URLs, so
          paging stays in the browser. */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        getHref={pageHref}
        navigate={!isFiltered}
      />
    </div>
  );
}
