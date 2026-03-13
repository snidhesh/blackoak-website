'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export default function CountUp({ end, suffix = '', duration = 2, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);

      if (current !== start) {
        start = current;
        setCount(current);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    }

    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  );
}
