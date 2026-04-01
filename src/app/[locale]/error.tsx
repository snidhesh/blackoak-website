'use client';

import { useTranslations } from 'next-intl';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('pages.error');

  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-[48px] font-light text-black">{t('heading')}</h1>
        <p className="mt-4 text-[16px] leading-[28px] text-[#5f6368] max-w-md mx-auto">
          {t('description')}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-black text-white text-[14px] font-medium tracking-wider uppercase hover:bg-gray-900 transition-colors"
          >
            {t('tryAgain')}
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-black text-black text-[14px] font-medium tracking-wider uppercase hover:bg-black hover:text-white transition-colors"
          >
            {t('homepage')}
          </a>
        </div>
      </div>
    </section>
  );
}
