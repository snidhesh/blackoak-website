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
    <div className={cn('border-t border-[#ccc]', className)}>
      {items.map((item, index) => (
        <div key={index} className="border-b border-[#ccc]">
          <button
            className="flex items-center justify-between w-full py-4 pr-4 text-left"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
          >
            <span className="text-[22px] font-normal leading-[40px] text-black pr-4">{item.question}</span>
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
              openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
            )}
          >
            <p className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368]">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
