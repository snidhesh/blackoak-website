'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimateOnScroll({ children, className, delay = 0 }: AnimateOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
