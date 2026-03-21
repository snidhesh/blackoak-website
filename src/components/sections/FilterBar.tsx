'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import LocationFilter from '@/components/ui/LocationFilter';

export interface FilterState {
  neighbourhoods: string[];
  propertyType: string;
  bedrooms: string;
  priceRange: string;
  offering: string;
}

interface FilterBarProps {
  neighbourhoods: string[];
  propertyTypes: string[];
  offerings: string[];
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
  sort: string;
  resultCount: number;
}

function formatNeighbourhood(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function FilterBar({
  neighbourhoods,
  propertyTypes,
  offerings,
  onFilterChange,
  onSortChange,
  sort,
  resultCount,
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    neighbourhoods: [],
    propertyType: '',
    bedrooms: '',
    priceRange: '',
    offering: '',
  });

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const updateNeighbourhoods = useCallback(
    (values: string[]) => {
      const newFilters = { ...filters, neighbourhoods: values };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const hasActiveFilters =
    filters.neighbourhoods.length > 0 ||
    filters.propertyType ||
    filters.bedrooms ||
    filters.priceRange ||
    filters.offering;

  const handleReset = () => {
    const empty: FilterState = {
      neighbourhoods: [],
      propertyType: '',
      bedrooms: '',
      priceRange: '',
      offering: '',
    };
    setFilters(empty);
    onFilterChange(empty);
  };

  return (
    <div className="space-y-0">
      {/* Filter row */}
      <div className="flex flex-col md:flex-row items-stretch">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 border border-gray-200 min-w-0">
          {/* Buy / Rent toggle buttons */}
          {offerings.length > 0 && (
            <div className="flex items-center border-r border-b md:border-b-0 border-gray-200">
              {offerings.map(o => {
                const label = o === 'sale' ? 'Buy' : o === 'rent' ? 'Rent' : o.charAt(0).toUpperCase() + o.slice(1);
                const isActive = filters.offering === o;
                return (
                  <button
                    key={o}
                    onClick={() => updateFilter('offering', isActive ? '' : o)}
                    className={cn(
                      'flex-1 px-4 py-3.5 text-[13px] transition-colors cursor-pointer',
                      isActive
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-gray-50'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Location — multi-select autocomplete */}
          <LocationFilter
            options={neighbourhoods.map(n => ({
              value: n,
              label: formatNeighbourhood(n),
            }))}
            selected={filters.neighbourhoods}
            onChange={updateNeighbourhoods}
            placeholder="Search location..."
          />

          {/* Property Type */}
          <FilterSelect
            placeholder="Property Type"
            value={filters.propertyType}
            onChange={(v) => updateFilter('propertyType', v)}
            options={propertyTypes.map(t => ({ value: t, label: t }))}
          />

          {/* Bedrooms */}
          <FilterSelect
            placeholder="Bedrooms"
            value={filters.bedrooms}
            onChange={(v) => updateFilter('bedrooms', v)}
            options={[
              { value: '1', label: '1 Bedroom' },
              { value: '2', label: '2 Bedrooms' },
              { value: '3', label: '3 Bedrooms' },
              { value: '4', label: '4+ Bedrooms' },
            ]}
          />

          {/* Price Range */}
          <FilterSelect
            placeholder="Price Range"
            value={filters.priceRange}
            onChange={(v) => updateFilter('priceRange', v)}
            options={[
              { value: '0-2000000', label: 'Under AED 2M' },
              { value: '2000000-5000000', label: 'AED 2M – 5M' },
              { value: '5000000-10000000', label: 'AED 5M – 10M' },
              { value: '10000000-20000000', label: 'AED 10M – 20M' },
              { value: '20000000-999999999', label: 'AED 20M+' },
            ]}
          />
        </div>
      </div>

      {/* Results count + Sort + Clear */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <p className="text-[13px] text-[#5F6368]">
            <span className="font-semibold text-black">{resultCount}</span>{' '}
            {resultCount === 1 ? 'property' : 'properties'} found
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[12px] text-[#5F6368] hover:text-black transition-colors"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#5F6368] uppercase tracking-wider">Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-[13px] font-medium bg-transparent border-none outline-none cursor-pointer appearance-none pr-4"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%235F6368\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
          >
            <option value="most-recent">Most Recent</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* Individual filter select — used for non-location filters */
function FilterSelect({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative border-r border-b md:border-b-0 border-gray-200 last:border-r-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-4 py-3.5 text-[13px] bg-white appearance-none cursor-pointer outline-none pr-8 text-black"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5">
        {value && (
          <button
            className="pointer-events-auto p-0.5 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
          >
            <X className="w-3 h-3 text-[#5F6368]" />
          </button>
        )}
        <ChevronDown className={cn('w-3.5 h-3.5 text-[#5F6368]')} />
      </div>
    </div>
  );
}
