import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getCareers } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.career' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Dubai real estate jobs', 'real estate career Dubai', 'property consultant jobs Dubai', 'luxury real estate careers', 'BlackOak careers', 'real estate agent jobs UAE'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/career/' : `https://blackoak-re.com/${locale}/career/`,
      languages: { en: 'https://blackoak-re.com/career/', fr: 'https://blackoak-re.com/fr/career/', ar: 'https://blackoak-re.com/ar/career/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/career/' : `https://blackoak-re.com/${locale}/career/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

const whyJoinCardKeys = ['career', 'wealth', 'lifestyle'] as const;

const cardImages: Record<string, string> = {
  career: '/images/career/card-career.png',
  wealth: '/images/career/card-wealth.png',
  lifestyle: '/images/career/card-lifestyle.png',
};

const galleryImages = [
  '/images/career/gallery-1.png',
  '/images/career/gallery-2.png',
  '/images/career/gallery-3.png',
  '/images/career/gallery-4.png',
  '/images/career/gallery-5.png',
  '/images/career/gallery-6.png',
  '/images/career/gallery-7.png',
  '/images/career/gallery-8.png',
  '/images/career/gallery-9.png',
  '/images/career/gallery-5.png',
];

function formatPostedDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default async function CareerPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations('pages.career');
  const tCommon = await getTranslations('common');
  const careers = getCareers(locale);

  const whyJoinCards = whyJoinCardKeys.map((key) => ({
    key,
    label: t(`whyJoinCards.${key}.label`),
    title: t(`whyJoinCards.${key}.title`),
    image: cardImages[key],
    description: t(`whyJoinCards.${key}.description`),
  }));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.careers'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/career/` },
    ],
  };

  const careerJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Careers at BlackOak Real Estate',
    description: 'Join BlackOak Real Estate. Open positions for real estate consultants, investment advisors & property specialists in Dubai.',
    url: locale === 'en' ? 'https://blackoak-re.com/career/' : `https://blackoak-re.com/${locale}/career/`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: careers.length,
      itemListElement: careers.map((job, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'JobPosting',
          title: job.title,
          datePosted: job.postedDate,
          jobLocation: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'AE' },
          },
          hiringOrganization: { '@type': 'Organization', name: 'BlackOak Real Estate', sameAs: 'https://blackoak-re.com' },
          url: locale === 'en' ? `https://blackoak-re.com/career/${job.slug}/` : `https://blackoak-re.com/${locale}/career/${job.slug}/`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(careerJsonLd) }}
      />
      {/* Header Label + Heading */}
      <section className="pt-[156px] pb-8">
        <div className="container-narrow text-center">
          <SectionLabel>{t('headerLabel')}</SectionLabel>
          <div className="mt-5 text-center">
            <h1 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
              {t('heading')}
            </h1>
          </div>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <Image
          src="/images/career/hero.png"
          alt={t('heroAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-[rgba(7,35,75,0.9)] to-transparent" />
      </section>

      {/* Intro Text */}
      <section className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-[16px] font-normal leading-[28px] tracking-[0.16px] text-[#5f6368] text-center max-w-[1382px] mx-auto space-y-6">
              <p>{t('introP1')}</p>
              <p>{t('introP2')}</p>
              <p>{t('introP3')}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Why Join Our Team - Dark Section */}
      <section className="py-20 bg-black">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel light>{t('whyJoinLabel')}</SectionLabel>
              <SectionHeading
                title={t('whyJoinHeading')}
                light
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
            {whyJoinCards.map((card, i) => (
              <AnimateOnScroll key={card.key} delay={i * 0.15}>
                <div className="flex flex-col gap-5">
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-6 left-[22px]">
                      <p className="text-[20px] font-light leading-[48px] text-white">
                        &nbsp;{card.label}
                      </p>
                      <p className="text-[50px] font-light leading-[48px] text-white">
                        {card.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-[16px] font-normal leading-[1.5] tracking-[0.16px] text-[#e2e2e2] max-w-[439px]">
                    {card.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Openings */}
      <section className="pb-6 pt-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>{t('exploreOpeningsLabel')}</SectionLabel>
            <SectionHeading
              title={t('exploreOpeningsHeading')}
              className="mt-5"
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Job Listings */}
      <section className="pb-20">
        <div className="max-w-[1080px] mx-auto px-6">
          {careers.map((job, i) => (
            <AnimateOnScroll key={job.slug} delay={i * 0.1}>
              <div className="border-t border-b border-[#ccc] py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <h3 className="text-[20px] font-semibold leading-[20px] text-black">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-[10px] text-[14px] font-normal text-[#5f6368]">
                    <span className="flex items-center gap-[5px]">
                      <MapPin className="w-[14px] h-[14px]" />
                      {job.location}
                    </span>
                    <span className="text-[#ccc]">|</span>
                    <span>{job.department}</span>
                    <span className="text-[#ccc]">|</span>
                    <span>{tCommon('postedOn', { date: formatPostedDate(job.postedDate) })}</span>
                  </div>
                </div>
                <Link
                  href={`/career/${job.slug}`}
                  className="bg-black border-2 border-black text-white text-[12px] font-medium uppercase tracking-wider h-[48px] w-[160px] flex items-center justify-center hover:bg-gray-900 transition-colors shrink-0"
                >
                  {t('viewDetails')}
                </Link>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Life at BlackOak - Photo Gallery */}
      <section className="py-20">
        <div className="container-narrow text-center mb-12">
          <AnimateOnScroll>
            <SectionLabel>{t('lifeAtBlackoakLabel')}</SectionLabel>
            <SectionHeading
              title={t('lifeAtBlackoakHeading')}
              className="mt-5 max-w-[604px] mx-auto"
            />
          </AnimateOnScroll>
        </div>

        <div className="overflow-hidden">
          <div className="flex flex-col gap-[10px]">
            {/* Row 1 */}
            <div className="flex gap-[10px] justify-center">
              {galleryImages.slice(0, 5).map((img, i) => (
                <div key={i} className="relative w-[396px] h-[360px] shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={img}
                    alt={t('lifeAtBlackoakImageAlt', { index: i + 1 })}
                    fill
                    className="object-cover"
                    sizes="396px"
                  />
                </div>
              ))}
            </div>
            {/* Row 2 */}
            <div className="flex gap-[10px] justify-center">
              {galleryImages.slice(5, 10).map((img, i) => (
                <div key={i} className="relative w-[396px] h-[360px] shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={img}
                    alt={t('lifeAtBlackoakImageAlt', { index: i + 6 })}
                    fill
                    className="object-cover"
                    sizes="396px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
