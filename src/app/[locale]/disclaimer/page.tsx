import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getDisclaimer } from '@/lib/content';
import type { Locale } from '@/i18n/config';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.disclaimer' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/disclaimer/' : `https://blackoak-re.com/${locale}/disclaimer/`,
      languages: { en: 'https://blackoak-re.com/disclaimer/', fr: 'https://blackoak-re.com/fr/disclaimer/', ar: 'https://blackoak-re.com/ar/disclaimer/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      url: 'https://blackoak-re.com/disclaimer/',
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

export default function DisclaimerPage({ params }: { params: { locale: string } }) {
  const disclaimerData = getDisclaimer(params.locale as Locale);

  return (
    <section className="pt-24 pb-20">
      <div className="container-narrow">
        {disclaimerData.sections.map((section: { title: string; content: string }, i: number) => (
          <div key={i} className={i > 0 ? 'mt-10' : ''}>
            {i === 0 ? (
              <h1 className="text-4xl font-semibold mb-6">{section.title}</h1>
            ) : (
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            )}
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
