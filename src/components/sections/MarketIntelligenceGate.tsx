'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { inertProps } from '@/lib/utils';
import { hasPendingCode, hasSubscribed } from '@/lib/unlock-storage';
import SubscribeUnlockForm, { SubscribeUnlockPanel } from '@/components/sections/SubscribeUnlockForm';

interface MarketIntelligenceGateProps {
  children: React.ReactNode;
}

// Teases the top of the module, then reveals everything once the visitor has
// subscribed (here or on the Intelligence Hub: one subscription covers both).
export default function MarketIntelligenceGate({ children }: MarketIntelligenceGateProps) {
  const t = useTranslations('pages.insights.marketIntelligence.gate');
  const panelId = useId();
  const titleId = useId();

  // Locked on the server and on the first client render, so the markup always
  // matches. Returning subscribers are unlocked before paint below.
  const [unlocked, setUnlocked] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Layout effect, not effect: on client-side navigation there is no inline
  // script to pre-unlock the page, so this has to land before the first paint.
  useLayoutEffect(() => {
    if (hasSubscribed()) setUnlocked(true);
  }, []);

  // A code requested before a reload reopens the panel at the code step.
  useEffect(() => {
    if (!hasSubscribed() && hasPendingCode()) setFormOpen(true);
  }, []);

  const onUnlocked = () => {
    setUnlocked(true);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const locked = !unlocked;

  return (
    <div ref={topRef} className="scroll-mt-20">
      <div className="mi-gate-clip relative" data-locked={locked}>
        {/* inertProps, never inert={true}: see the note on the helper. */}
        <div {...inertProps(locked)}>{children}</div>
        {locked && (
          <div
            aria-hidden="true"
            className="mi-gate-fade pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent via-black/85 to-black"
          />
        )}
      </div>

      {locked && (
        <SubscribeUnlockPanel
          open={formOpen}
          onToggle={() => setFormOpen((open) => !open)}
          panelId={panelId}
          unlockLabel={t('unlockButton')}
        >
          <SubscribeUnlockForm
            source="market-intelligence"
            open={formOpen}
            title={t('title')}
            body={t('body')}
            titleId={titleId}
            onUnlocked={onUnlocked}
          />
        </SubscribeUnlockPanel>
      )}
    </div>
  );
}
