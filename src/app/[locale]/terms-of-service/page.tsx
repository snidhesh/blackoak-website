import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getTermsOfService } from '@/lib/content';
import type { Locale } from '@/i18n/config';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.termsOfService' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/terms-of-service/' : `https://blackoak-re.com/${locale}/terms-of-service/`,
      languages: { en: 'https://blackoak-re.com/terms-of-service/', fr: 'https://blackoak-re.com/fr/terms-of-service/', ar: 'https://blackoak-re.com/ar/terms-of-service/' },
    },
    keywords: ['terms of service BlackOak', 'BlackOak Real Estate terms', 'real estate terms of service Dubai', 'property terms and conditions UAE'],
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      siteName: 'BlackOak Real Estate',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/terms-of-service/' : `https://blackoak-re.com/${locale}/terms-of-service/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

export default function TermsOfServicePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const termsData = getTermsOfService(locale);

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: termsData.sections[0]?.title || 'Terms of Service',
    url: locale === 'en' ? 'https://blackoak-re.com/terms-of-service/' : `https://blackoak-re.com/${locale}/terms-of-service/`,
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', name: 'BlackOak Real Estate', url: 'https://blackoak-re.com' },
    dateModified: '2026-05-01',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <section className="pt-24 pb-20">
        <div className="container-narrow">
          {termsData.sections.map((section: { title: string; content: string }, i: number) => (
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
    </>
  );
}
