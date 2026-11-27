'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableTextProps {
  text: string;
  showMoreLabel: string;
  showLessLabel: string;
  /** Height of the collapsed text in pixels. Default 224 (eight lines of body text). */
  collapsedHeight?: number;
  /** Classes for the text itself */
  className?: string;
}

/**
 * Long text shown as a short preview with a "Show more" toggle. The full text
 * is always in the page (only clipped), so search engines and screen readers
 * still get all of it. Text that already fits is shown without a toggle.
 */
export default function ExpandableText({
  text,
  showMoreLabel,
  showLessLabel,
  collapsedHeight = 224,
  className,
}: ExpandableTextProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  // Assume it needs clipping until measured, so a long text never flashes at full height.
  const [overflows, setOverflows] = useState(true);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > collapsedHeight + 24);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsedHeight, text]);

  const toggle = () => {
    // Collapsing from far down the text would leave the reader below it, so
    // bring the start of the text back into view first.
    if (expanded && wrapperRef.current) {
      const top = wrapperRef.current.getBoundingClientRect().top + window.scrollY - 200;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'instant' });
    }
    setExpanded((v) => !v);
  };

  const clipped = overflows && !expanded;

  return (
    <div ref={wrapperRef}>
      <div
        id={id}
        className="relative overflow-hidden"
        style={clipped ? { maxHeight: collapsedHeight } : undefined}
      >
        <p ref={textRef} className={className}>
          {text}
        </p>
        {clipped && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent"
          />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={id}
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[2px] text-black border-b border-black/30 hover:border-black pb-1 transition-colors"
        >
          {expanded ? showLessLabel : showMoreLabel}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}
