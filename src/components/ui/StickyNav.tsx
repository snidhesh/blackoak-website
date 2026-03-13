'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StickyNavProps {
  sections: { id: string; label: string }[];
}

export default function StickyNav({ sections }: StickyNavProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-16 lg:top-20 z-40 bg-white border-b border-gray-200">
      <div className="container-wide flex items-center gap-8 overflow-x-auto scrollbar-hide">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className={cn(
              'py-7 text-sm font-medium whitespace-nowrap border-b-[3px] transition-colors',
              activeSection === section.id
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
