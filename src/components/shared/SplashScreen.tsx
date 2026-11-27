'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  logo: string;
  heading: string;
  subtext: string;
  backgroundImage: string | null;
  autoPlayDuration: number;
  skipLabel?: string;
}

/**
 * Homepage splash. It is rendered on the server and its entrance runs on CSS
 * animations (keyframes in globals.css, "Splash gate"), so it paints with the
 * first HTML instead of waiting for JavaScript. CSS shows it only while
 * <html data-splash="pending">; JavaScript handles the timer, the skip button
 * and the fade-out.
 */
export default function SplashScreen({
  logo,
  heading,
  subtext,
  backgroundImage,
  autoPlayDuration,
  skipLabel = 'Skip Intro',
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    clearTimeout(window.__splashTimer);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (document.documentElement.dataset.splash !== 'pending') return;

    const timer = setTimeout(dismiss, autoPlayDuration);
    return () => clearTimeout(timer);
  }, [autoPlayDuration, dismiss]);

  const handleExitComplete = () => {
    delete document.documentElement.dataset.splash;
  };

  return (
    <AnimatePresence initial={false} onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="splash-screen fixed inset-0 z-[60] flex-col items-center justify-center"
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
          {/* Logo — scale + fade */}
          <div style={{ animation: 'splash-logo 0.8s ease-out both' }}>
            <Image
              src={logo}
              alt="BlackOak"
              width={180}
              height={60}
              priority
              className="w-[140px] md:w-[180px] h-auto"
            />
          </div>

          {/* Heading — slide up + fade. A <p>, not a heading: the page has its own <h1>. */}
          <p
            style={{ animation: 'splash-rise 0.6s ease-out 0.4s both' }}
            className="mt-8 text-white text-center text-[28px] md:text-[42px] font-light leading-[1.2] max-w-2xl px-6"
          >
            {heading}
          </p>

          {/* Subtext — fade only */}
          <p
            style={{ animation: 'splash-fade 0.5s ease-out 0.8s both' }}
            className="mt-4 text-white/70 text-center text-[14px] md:text-[16px] font-light leading-[1.6] max-w-xl px-6"
          >
            {subtext}
          </p>

          {/* Skip button */}
          <button
            style={{ animation: 'splash-fade 0.3s ease-out 1.2s both' }}
            onClick={dismiss}
            className="absolute bottom-10 text-white/50 hover:text-white text-[11px] tracking-[2px] uppercase transition-colors cursor-pointer"
          >
            {skipLabel}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
