'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn('divide-y divide-gray-200', className)}>
      {items.map((item, index) => (
        <div key={index}>
          <button
            className="flex items-center justify-between w-full py-5 text-left"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
          >
            <span className="text-base font-medium pr-4">{item.question}</span>
            <ChevronDown
              className={cn(
                'w-5 h-5 flex-shrink-0 transition-transform',
                openIndex === index && 'rotate-180'
              )}
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'
            )}
          >
            <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
