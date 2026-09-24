'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Lock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { hasPendingCode, hasSubscribed } from '@/lib/unlock-storage';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import SubscribeUnlockForm, { SubscribeUnlockPanel } from '@/components/sections/SubscribeUnlockForm';

// Only the Briefing needs a server-side gate, so it is the only place the
// middleware can send a visitor back from. Parsed as a URL and pinned to this
// origin: never a string match, never rendered into the page.
const NEXT_PATH_PATTERN = /^\/briefing(\/|$)/;

function readNextFromLocation(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get('next');
    if (!raw) return null;
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin || !NEXT_PATH_PATTERN.test(url.pathname)) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

type TileKey = 'marketIntelligence' | 'briefing';
const TILES: TileKey[] = ['marketIntelligence', 'briefing'];

const ctaClass =
  'inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider text-black transition-colors [@media(hover:hover)]:hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold';

export default function IntelligenceHub() {
  const t = useTranslations('pages.insights.intelligence');
  const panelId = useId();
  const titleId = useId();

  // Locked on the server and on the first client render, so the markup always
  // matches. Returning subscribers are unlocked before paint below.
  const [unlocked, setUnlocked] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [next, setNext] = useState<string | null>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const target = readNextFromLocation();
    if (target) {
      // Bounced from /briefing: the cookie is missing or expired, whatever the
      // browser remembers. Verify again, then continue to where they were going.
      setNext(target);
      setFormOpen(true);
    } else if (hasSubscribed()) {
      setUnlocked(true);
    }
  }, []);

  // A code requested before a reload reopens the panel at the code step.
  useEffect(() => {
    if (!hasSubscribed() && hasPendingCode()) setFormOpen(true);
  }, []);

  const scrollTo = (el: HTMLElement | null) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }));
  };

  const openForm = () => {
    setFormOpen(true);
    scrollTo(panelRef.current);
  };

  const onUnlocked = () => {
    if (next) {
      window.location.assign(next);
      return;
    }
    setUnlocked(true);
    window.history.replaceState(null, '', window.location.pathname);
    scrollTo(tilesRef.current);
  };

  const locked = !unlocked;

  return (
    <>
      <section className="bg-white pb-20 md:pb-28">
        <div className="container-wide">
          <div ref={tilesRef} className="grid gap-6 scroll-mt-28 md:grid-cols-2 lg:gap-8">
            {TILES.map((key, index) => {
              const points = [t(`tiles.${key}.point1`), t(`tiles.${key}.point2`), t(`tiles.${key}.point3`)];
              const ctaLabel = t(`tiles.${key}.cta`);
              const cta = (
                <>
                  {ctaLabel}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
                </>
              );
              return (
                <AnimateOnScroll key={key} delay={index * 0.1}>
                  <article
                    data-locked={locked}
                    className="intel-tile flex h-full flex-col border border-gray-200 bg-white p-8 transition-colors [@media(hover:hover)]:hover:border-black md:p-10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">{t(`tiles.${key}.eyebrow`)}</p>
                      <span
                        className="intel-lock inline-flex shrink-0 items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#5f6368]"
                        aria-label={t('locked')}
                      >
                        <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                        <span aria-hidden="true">{t('locked')}</span>
                      </span>
                    </div>

                    <h2 className="mt-5 text-[26px] font-light leading-[1.15] tracking-tight text-black md:text-[30px]">
                      {t(`tiles.${key}.title`)}
                    </h2>
                    <p className="mt-4 text-[15px] leading-[1.7] text-[#5f6368]">{t(`tiles.${key}.description`)}</p>

                    <ul className="mt-6 space-y-2.5 text-[14px] leading-[1.6] text-[#0a0a0a]">
                      {points.map((point) => (
                        <li key={point} className="flex gap-3">
                          <span aria-hidden="true" className="mt-[11px] h-px w-4 shrink-0 bg-gold" />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto border-t border-gray-100 pt-6 md:pt-8">
                      <button type="button" onClick={openForm} className={`intel-cta-locked ${ctaClass}`}>
                        {t('unlockCta')}
                        <ArrowRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
                      </button>
                      {key === 'briefing' ? (
                        // Plain anchor: the Briefing is proxied at one unprefixed path,
                        // so the locale-aware Link must not turn it into /fr/briefing/.
                        <a href="/briefing/" className={`intel-cta-open ${ctaClass}`}>
                          {cta}
                        </a>
                      ) : (
                        <Link href="/insights/market-intelligence" className={`intel-cta-open ${ctaClass}`}>
                          {cta}
                        </Link>
                      )}
                    </div>
                  </article>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {locked && (
        <div ref={panelRef} className="scroll-mt-20">
          <SubscribeUnlockPanel
            open={formOpen}
            onToggle={() => setFormOpen((open) => !open)}
            panelId={panelId}
            unlockLabel={t('gate.unlockButton')}
          >
            <SubscribeUnlockForm
              source="intelligence-hub"
              open={formOpen}
              title={t('gate.title')}
              body={t('gate.body')}
              titleId={titleId}
              onUnlocked={onUnlocked}
            />
          </SubscribeUnlockPanel>
        </div>
      )}
    </>
  );
}
