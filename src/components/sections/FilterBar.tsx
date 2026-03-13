'use client';

import { useState } from 'react';
import Select from '@/components/ui/Select';

interface FilterBarProps {
  neighbourhoods: string[];
  propertyTypes: string[];
  onFilterChange: (filters: {
    neighbourhood: string;
    propertyType: string;
    bedrooms: string;
    priceRange: string;
  }) => void;
}

export default function FilterBar({ neighbourhoods, propertyTypes, onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState({
    neighbourhood: '',
    propertyType: '',
    bedrooms: '',
    priceRange: '',
  });

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const empty = { neighbourhood: '', propertyType: '', bedrooms: '', priceRange: '' };
    setFilters(empty);
    onFilterChange(empty);
  };

  return (
    <div className="bg-gray-100 border border-gray-200 p-4 flex flex-col md:flex-row items-center gap-4">
      <div className="flex-1 w-full">
        <Select
          placeholder="Location"
          options={neighbourhoods.map(n => ({ value: n, label: n.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }))}
          value={filters.neighbourhood}
          onChange={(e) => handleChange('neighbourhood', e.target.value)}
        />
      </div>
      <div className="hidden md:block w-px h-6 bg-gray-200" />
      <div className="flex-1 w-full">
        <Select
          placeholder="Property Type"
          options={propertyTypes.map(t => ({ value: t, label: t }))}
          value={filters.propertyType}
          onChange={(e) => handleChange('propertyType', e.target.value)}
        />
      </div>
      <div className="hidden md:block w-px h-6 bg-gray-200" />
      <div className="flex-1 w-full">
        <Select
          placeholder="Price Range"
          options={[
            { value: '0-2000000', label: 'Under AED 2M' },
            { value: '2000000-5000000', label: 'AED 2M - 5M' },
            { value: '5000000-10000000', label: 'AED 5M - 10M' },
            { value: '10000000-999999999', label: 'AED 10M+' },
          ]}
          value={filters.priceRange}
          onChange={(e) => handleChange('priceRange', e.target.value)}
        />
      </div>
      <div className="hidden md:block w-px h-6 bg-gray-200" />
      <div className="flex-1 w-full">
        <Select
          placeholder="Bedrooms"
          options={[
            { value: '1', label: '1 Bedroom' },
            { value: '2', label: '2 Bedrooms' },
            { value: '3', label: '3 Bedrooms' },
            { value: '4', label: '4+ Bedrooms' },
          ]}
          value={filters.bedrooms}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleSearch}
          className="px-5 py-3 bg-black text-white text-xs font-medium tracking-wider uppercase hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-3 border border-gray-300 text-xs font-medium tracking-wider uppercase text-gray-600 hover:border-black hover:text-black transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
