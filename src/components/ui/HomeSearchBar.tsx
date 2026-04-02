'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { MapPin, Search } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface HomeSearchBarProps {
  neighbourhoods: { value: string; label: string }[];
}

export default function HomeSearchBar({ neighbourhoods }: HomeSearchBarProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const filtered = query
    ? neighbourhoods.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (value: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/projects?location=${encodeURIComponent(value)}`);
  };

  const handleSearch = () => {
    router.push('/projects');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].value);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-2xl mx-auto w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-stretch bg-white rounded overflow-hidden shadow-lg h-[56px]">
        <div
          className="flex-1 flex items-center gap-2.5 px-5 cursor-text"
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
        >
          <MapPin className="w-4 h-4 text-[#5F6368] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('filter.searchLocation')}
            className="flex-1 text-[14px] outline-none bg-transparent placeholder:text-[#5F6368] text-black"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
            }
            autoComplete="off"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-black px-8 flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
        >
          <Search className="w-4 h-4 text-white" />
          <span className="text-white text-[12px] font-medium tracking-wider uppercase">
            {t('filter.searchButton')}
          </span>
        </button>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-stretch bg-white/10 backdrop-blur-sm border border-white/30 rounded overflow-hidden h-[50px]">
        <div
          className="flex-1 flex items-center gap-2.5 px-4 cursor-text"
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
        >
          <MapPin className="w-4 h-4 text-white/70 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('filter.searchLocation')}
            className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-white/60 text-white"
            autoComplete="off"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-white px-5 flex items-center justify-center"
        >
          <Search className="w-4 h-4 text-black" />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && filtered.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute start-0 end-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[240px] overflow-y-auto"
        >
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              id={`${listboxId}-opt-${i}`}
              role="option"
              aria-selected={highlightedIndex === i}
              className={cn(
                'px-4 py-2.5 text-[13px] cursor-pointer transition-colors flex items-center gap-2',
                highlightedIndex === i
                  ? 'bg-gray-100 text-black'
                  : 'text-[#5F6368] hover:bg-gray-50 hover:text-black'
              )}
              onMouseEnter={() => setHighlightedIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt.value);
              }}
            >
              <MapPin className="w-3 h-3 shrink-0" />
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
