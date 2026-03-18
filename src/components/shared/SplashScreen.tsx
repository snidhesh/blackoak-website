'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  logo: string;
  heading: string;
  subtext: string;
  backgroundImage: string | null;
  autoPlayDuration: number;
}

export default function SplashScreen({
  logo,
  heading,
  subtext,
  backgroundImage,
  autoPlayDuration,
}: SplashScreenProps) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    clearTimeout(window.__splashTimer);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.splash !== 'pending') return;
    setVisible(true);

    const timer = setTimeout(dismiss, autoPlayDuration);
    return () => clearTimeout(timer);
  }, [autoPlayDuration, dismiss]);

  const handleExitComplete = () => {
    delete document.documentElement.dataset.splash;
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
          style={{
            backgroundColor: '#181a20',
            ...(backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}),
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={logo}
              alt="BlackOak"
              width={180}
              height={60}
              priority
              className="w-[140px] md:w-[180px] h-auto"
            />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-white text-center text-[28px] md:text-[42px] font-light leading-[1.2] max-w-2xl px-6"
          >
            {heading}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-4 text-white/70 text-center text-[14px] md:text-[16px] font-light leading-[1.6] max-w-xl px-6"
          >
            {subtext}
          </motion.p>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            onClick={dismiss}
            className="absolute bottom-10 text-white/50 hover:text-white text-[11px] tracking-[2px] uppercase transition-colors cursor-pointer"
          >
            Skip Intro
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
