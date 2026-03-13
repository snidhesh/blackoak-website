'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  className?: string;
}

export default function Tabs({ tabs, className }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={className}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeIndex === index
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{tabs[activeIndex]?.content}</div>
    </div>
  );
}
