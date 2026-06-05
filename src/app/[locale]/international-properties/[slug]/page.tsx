import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  getInternationalProperties,
  getInternationalPropertyBySlug,
  getInternationalCountryByCode,
} from '@/lib/content';
import type { Locale } from '@/i18n/config';
import InternationalPropertyDetailPage from './InternationalPropertyDetailPage';

export const revalidate = 300;

interface Props {
  params: { slug: string; locale: string };
}

export async function generateStaticParams() {
  return getInternationalProperties()
    .filter((p) => p.status === 'available')
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const property = getInternationalPropertyBySlug(params.slug, locale);
  const tMeta = await getTranslations({ locale, namespace: 'metadata.internationalProperties' });

  if (!property || property.status !== 'available') {
    return { title: tMeta('title') };
  }

  const title = `${property.name} | ${property.city}, ${property.country}`;
  const description = property.description.length > 160
    ? `${property.description.slice(0, 157)}...`
    : property.description;

  const path = `/international-properties/${params.slug}/`;
  const canonicalUrl = locale === 'en'
    ? `https://blackoak-re.com${path}`
    : `https://blackoak-re.com/${locale}${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: canonicalUrl,
      images: [{ url: property.mainImage, width: 1200, height: 630, alt: property.name }],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `https://blackoak-re.com${path}`,
        fr: `https://blackoak-re.com/fr${path}`,
        ar: `https://blackoak-re.com/ar${path}`,
      },
    },
  };
}

export default async function Page({ params }: Props) {
  const locale = params.locale as Locale;
  const property = getInternationalPropertyBySlug(params.slug, locale);
  if (!property || property.status !== 'available') notFound();

  const country = getInternationalCountryByCode(property.countryCode, locale);

  return (
    <InternationalPropertyDetailPage
      property={property}
      country={country}
      locale={locale}
      slug={params.slug}
    />
  );
}
