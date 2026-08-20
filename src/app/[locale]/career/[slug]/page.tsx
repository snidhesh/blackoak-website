import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getCareers, getCareerBySlug } from '@/lib/content';
import { formatDate } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import CareerApplicationForm from './CareerApplicationForm';

interface Props {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  return getCareers().map((c) => ({ slug: c.slug }));
}

const COUNTRY_TO_ISO: Record<string, string> = {
  'united arab emirates': 'AE',
  uae: 'AE',
  'united kingdom': 'GB',
  uk: 'GB',
  'united states': 'US',
  usa: 'US',
};

function parseJobLocation(location: string) {
  const trimmed = location.trim();
  const iso = COUNTRY_TO_ISO[trimmed.toLowerCase()];
  if (iso) {
    return { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: iso } };
  }
  const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const countryPart = parts[parts.length - 1];
    return {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: parts.slice(0, -1).join(', '),
        addressCountry: COUNTRY_TO_ISO[countryPart.toLowerCase()] ?? countryPart,
      },
    };
  }
  return { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: trimmed } };
}

function parseEmploymentType(type: string): string | string[] {
  const t = type.toLowerCase();
  const out: string[] = [];
  if (/full[-\s]?time/.test(t)) out.push('FULL_TIME');
  if (/part[-\s]?time/.test(t)) out.push('PART_TIME');
  if (/contract/.test(t)) out.push('CONTRACTOR');
  if (/intern/.test(t)) out.push('INTERN');
  if (/temp/.test(t)) out.push('TEMPORARY');
  if (out.length === 0) return 'FULL_TIME';
  return out.length === 1 ? out[0] : out;
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale as Locale;
  const job = getCareerBySlug(params.slug, locale);
  if (!job) return { title: 'Not Found' };
  const title = `${job.title} | Careers at BlackOak Real Estate`;
  const description = `Join BlackOak as ${job.title} in ${job.location}. ${job.type}. ${job.description.slice(0, 120)}`;
  return {
    title,
    description,
    keywords: [`${job.title} Dubai`, 'real estate jobs Dubai', `${job.department} jobs Dubai`, 'BlackOak careers', 'luxury real estate career Dubai'],
    alternates: {
      canonical: locale === 'en' ? `https://blackoak-re.com/career/${params.slug}/` : `https://blackoak-re.com/${locale}/career/${params.slug}/`,
      languages: {
        en: `https://blackoak-re.com/career/${params.slug}/`,
        fr: `https://blackoak-re.com/fr/career/${params.slug}/`,
        ar: `https://blackoak-re.com/ar/career/${params.slug}/`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? `https://blackoak-re.com/career/${params.slug}/` : `https://blackoak-re.com/${locale}/career/${params.slug}/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function CareerDetailPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations('pages.career.detail');
  const job = getCareerBySlug(params.slug, locale);
  if (!job) notFound();

  const jobJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.postedDate,
    employmentType: parseEmploymentType(job.type),
    hiringOrganization: {
      '@type': 'Organization',
      name: 'BlackOak Real Estate',
      sameAs: 'https://blackoak-re.com',
    },
    jobLocation: parseJobLocation(job.location),
    directApply: true,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.careers'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/career/` },
      { '@type': 'ListItem', position: 3, name: job.title, item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/career/${params.slug}/` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="pt-24 pb-10">
        <div className="container-wide">
          <Link href="/career" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6">
            <ArrowLeft className="w-4 h-4" /> {t('backToPage')}
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                <span>{job.department}</span>
                <span>{t('postedOn', { date: formatDate(job.postedDate, locale) })}</span>
              </div>
            </div>
            <Button href="#apply-form" size="md">{t('applyNow')}</Button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-wide">
          <AnimateOnScroll>
            <h2 className="text-xl font-semibold mb-4">{job.department}</h2>
            <p className="text-gray-600 leading-relaxed">{job.description}</p>

            <div className="mt-8 space-y-3">
              <div className="flex gap-4">
                <span className="font-medium w-44 flex-shrink-0">{t('benefits')}</span>
                <span className="text-gray-600">{job.benefits}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium w-44 flex-shrink-0">{t('location')}</span>
                <span className="text-gray-600">{job.locationDetail}</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-10">
        <div className="container-wide">
          <AnimateOnScroll>
            <h2 className="text-xl font-semibold mb-6">{t('keyResponsibilities')}</h2>
            <div className="space-y-3">
              {job.responsibilities.map((r) => (
                <div key={r} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{r}</span>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-20 bg-gray-50">
        <div className="container-narrow">
          <AnimateOnScroll>
            <SectionLabel>{t('applyLabel')}</SectionLabel>
            <SectionHeading
              title={t('applyHeading')}
              className="mt-4 mb-10"
            />
          </AnimateOnScroll>
          <CareerApplicationForm jobSlug={job.slug} jobTitle={job.title} />
        </div>
      </section>
    </>
  );
}
