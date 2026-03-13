'use client';

import { useState, useMemo } from 'react';
import type { Project } from '@/types/project';
import FilterBar from '@/components/sections/FilterBar';
import PropertyGrid from '@/components/sections/PropertyGrid';
import Pagination from '@/components/ui/Pagination';

interface ProjectsClientProps {
  projects: Project[];
  neighbourhoodSlugs: string[];
  propertyTypes: string[];
}

const ITEMS_PER_PAGE = 9;

export default function ProjectsClient({
  projects,
  neighbourhoodSlugs,
  propertyTypes,
}: ProjectsClientProps) {
  const [filters, setFilters] = useState({
    neighbourhood: '',
    propertyType: '',
    bedrooms: '',
    priceRange: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState('most-recent');

  const filteredProjects = useMemo(() => {
    let result = projects.filter((p) => {
      if (filters.neighbourhood && p.neighbourhood !== filters.neighbourhood) return false;
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

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <>
      <FilterBar
        neighbourhoods={neighbourhoodSlugs}
        propertyTypes={propertyTypes}
        onFilterChange={handleFilterChange}
      />

      {/* Count + Sort row */}
      <div className="flex items-center justify-between mt-6 mb-6">
        <p className="text-sm text-gray-500">
          {filteredProjects.length} listing{filteredProjects.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm font-medium bg-white border border-gray-200 px-3 py-2 pr-8 appearance-none cursor-pointer"
          >
            <option value="most-recent">Most Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <PropertyGrid projects={paginatedProjects} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
