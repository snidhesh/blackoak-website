'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationOption {
  value: string;
  label: string;
}

interface LocationFilterProps {
  options: LocationOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function LocationFilter({
  options,
  selected,
  onChange,
  placeholder = 'Search location...',
}: LocationFilterProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const filtered = query
    ? options.filter(
        (o) =>
          !selected.includes(o.value) &&
          o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options.filter((o) => !selected.includes(o.value));

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v))
    .filter(Boolean) as LocationOption[];

  // Close on outside click
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

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const addValue = useCallback(
    (value: string) => {
      if (!selected.includes(value)) {
        onChange([...selected, value]);
      }
      setQuery('');
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [selected, onChange]
  );

  const removeValue = useCallback(
    (value: string) => {
      onChange(selected.filter((v) => v !== value));
    },
    [selected, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < filtered.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filtered.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        addValue(filtered[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Backspace' && !query && selected.length > 0) {
      removeValue(selected[selected.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className="relative border-r border-b md:border-b-0 border-gray-200 min-w-0">
      {/* Input area */}
      <div
        className="flex items-center flex-wrap gap-1.5 px-3 py-2 min-h-[46px] cursor-text bg-white overflow-hidden"
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
      >
        {selected.length === 0 && !query && (
          <MapPin className="w-3.5 h-3.5 text-[#5F6368] shrink-0" />
        )}

        {/* Selected pills */}
        {selectedLabels.map((opt) => (
          <span
            key={opt.value}
            className="inline-flex items-center gap-1 bg-gray-100 text-[11px] font-medium text-black px-2 py-0.5 rounded max-w-full shrink-0"
          >
            <span className="truncate">{opt.label}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(opt.value);
              }}
              className="hover:text-red-500 transition-colors shrink-0"
              aria-label={`Remove ${opt.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Text input */}
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
          placeholder={selected.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[60px] w-0 text-[13px] outline-none bg-transparent placeholder:text-[#5F6368]"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
          }
          autoComplete="off"
        />

        {/* Clear all */}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
              setQuery('');
            }}
            className="p-0.5 hover:bg-gray-100 rounded shrink-0"
            aria-label="Clear all locations"
          >
            <X className="w-3 h-3 text-[#5F6368]" />
          </button>
        )}
      </div>

      {/* Dropdown — fixed position on mobile to avoid overflow */}
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-full z-50 bg-white border border-gray-200 shadow-lg max-h-[240px] overflow-y-auto w-[min(100vw_-_2rem,_320px)] md:w-full md:right-0"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-[13px] text-[#5F6368]">
              No locations found
            </li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={highlightedIndex === i}
                className={cn(
                  'px-4 py-2.5 text-[13px] cursor-pointer transition-colors',
                  highlightedIndex === i
                    ? 'bg-gray-100 text-black'
                    : 'text-[#5F6368] hover:bg-gray-50 hover:text-black'
                )}
                onMouseEnter={() => setHighlightedIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addValue(opt.value);
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
