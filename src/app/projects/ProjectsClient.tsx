'use client';

import { useState, useMemo } from 'react';
import type { Project } from '@/types/project';
import FilterBar, { type FilterState } from '@/components/sections/FilterBar';
import PropertyGrid from '@/components/sections/PropertyGrid';
import Pagination from '@/components/ui/Pagination';

interface ProjectsClientProps {
  projects: Project[];
  neighbourhoodSlugs: string[];
  propertyTypes: string[];
  offerings: string[];
}

const ITEMS_PER_PAGE = 9;

export default function ProjectsClient({
  projects,
  neighbourhoodSlugs,
  propertyTypes,
  offerings,
}: ProjectsClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    neighbourhoods: [],
    propertyType: '',
    bedrooms: '',
    priceRange: '',
    offering: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState('most-recent');

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
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-x-hidden">
        <FilterBar
          neighbourhoods={neighbourhoodSlugs}
          propertyTypes={propertyTypes}
          offerings={offerings}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
