import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getNeighbourhoods, getNeighbourhoodBySlug, getProjectsByNeighbourhood } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import PropertyGrid from '@/components/sections/PropertyGrid';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string; slug: string };
}

export function generateStaticParams() {
  const neighbourhoods = getNeighbourhoods();
  return neighbourhoods.map((n) => ({ slug: n.slug }));
}

function compactPrice(price: number, currency: string): string {
  if (price >= 1_000_000_000) return `${currency} ${(price / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (price >= 1_000_000) return `${currency} ${(price / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (price >= 1_000) return `${currency} ${Math.round(price / 1_000)}K`;
  return `${currency} ${price}`;
}

function buildStatsSuffix(
  count: number,
  minPrice: number | null,
  currency: string,
  locale: Locale,
): string {
  if (count === 0) return '';
  const priceStr = minPrice ? compactPrice(minPrice, currency) : '';
  if (locale === 'fr') {
    return priceStr
      ? ` ${count} propriétés disponibles à partir de ${priceStr}.`
      : ` ${count} propriétés disponibles.`;
  }
  if (locale === 'ar') {
    return priceStr
      ? ` ${count} عقار متاح ابتداءً من ${priceStr}.`
      : ` ${count} عقار متاح.`;
  }
  return priceStr
    ? ` ${count} properties available from ${priceStr}.`
    : ` ${count} properties available.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const neighbourhood = getNeighbourhoodBySlug(params.slug, locale);
  if (!neighbourhood) return { title: 'Not Found' };

  const projects = await getProjectsByNeighbourhood(params.slug);
  const priced = projects.filter((p) => p.price > 0);
  const minPrice = priced.length ? Math.min(...priced.map((p) => p.price)) : null;
  const currency = priced[0]?.currency ?? 'AED';
  const statsSuffix = buildStatsSuffix(projects.length, minPrice, currency, locale);
  const description = `${neighbourhood.seo.description}${statsSuffix}`;

  const enhancedTitle = `${neighbourhood.seo.title} | Properties for Sale`;
  return {
    title: enhancedTitle,
    description,
    keywords: [`${neighbourhood.name} property for sale`, `${neighbourhood.name} villas for sale`, `${neighbourhood.name} apartments for sale`, `buy property ${neighbourhood.name}`, `${neighbourhood.name} real estate investment`, `invest ${neighbourhood.name} Dubai`, `luxury homes ${neighbourhood.name}`, `${neighbourhood.name} penthouse`, `${neighbourhood.name} Dubai property prices`],
    openGraph: {
      title: neighbourhood.seo.title,
      description,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? `https://blackoak-re.com/neighbourhoods/${params.slug}/` : `https://blackoak-re.com/${locale}/neighbourhoods/${params.slug}/`,
      images: [{ url: neighbourhood.heroImage, width: 1200, height: 630, alt: `${neighbourhood.name} - Dubai` }],
    },
    alternates: {
      canonical: locale === 'en' ? `https://blackoak-re.com/neighbourhoods/${params.slug}/` : `https://blackoak-re.com/${locale}/neighbourhoods/${params.slug}/`,
      languages: {
        en: `https://blackoak-re.com/neighbourhoods/${params.slug}/`,
        fr: `https://blackoak-re.com/fr/neighbourhoods/${params.slug}/`,
        ar: `https://blackoak-re.com/ar/neighbourhoods/${params.slug}/`,
      },
    },
  };
}

export const revalidate = 300;

export default async function NeighbourhoodPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations('pages.neighbourhoods');
  const neighbourhood = getNeighbourhoodBySlug(params.slug, locale);
  if (!neighbourhood) notFound();

  const projects = await getProjectsByNeighbourhood(params.slug);

  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: neighbourhood.name,
    description: neighbourhood.seo.description,
    url: locale === 'en' ? `https://blackoak-re.com/neighbourhoods/${params.slug}/` : `https://blackoak-re.com/${locale}/neighbourhoods/${params.slug}/`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: neighbourhood.name,
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    containedInPlace: {
      '@type': 'City',
      name: 'Dubai',
      containedInPlace: { '@type': 'Country', name: 'United Arab Emirates' },
    },
    image: neighbourhood.heroImage.startsWith('http') ? neighbourhood.heroImage : `https://blackoak-re.com${neighbourhood.heroImage}`,
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(neighbourhood.name + ', Dubai, UAE')}`,
  };

  const faqJsonLd = neighbourhood.whyInvest.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: neighbourhood.whyInvest.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.description,
      },
    })),
  } : null;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.neighbourhoods'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/neighbourhoods/` },
      { '@type': 'ListItem', position: 3, name: neighbourhood.name, item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/neighbourhoods/${params.slug}/` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Hero */}
      <section className="relative h-[800px] flex items-center justify-center overflow-hidden">
        <Image
          src={neighbourhood.heroImage}
          alt={neighbourhood.name}
          fill
          className="object-cover"
          priority
        />
        {/* Top gradient for navbar */}
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-black/90 to-transparent" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-[50px] font-light leading-tight">{neighbourhood.name}</h1>
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-8">
              <SectionLabel>{t('aboutLabel', { name: neighbourhood.name })}</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                {neighbourhood.tagline}
              </h2>
            </div>
            <p className="text-[#5f6368] text-base leading-[28px] tracking-[0.16px] max-w-[1216px] mx-auto whitespace-pre-line">
              {neighbourhood.description}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Properties */}
      {projects.length > 0 && (
        <section className="py-16">
          <div className="container-wide">
            <AnimateOnScroll>
              <h2 className="text-[32px] font-light text-center mb-10">
                {t('propertiesIn', { name: neighbourhood.name })}
              </h2>
            </AnimateOnScroll>
            <PropertyGrid projects={projects} />
          </div>
        </section>
      )}

      {/* Attractions */}
      {neighbourhood.attractions.length > 0 && (
        <section className="py-20 bg-[#1a1a1a]">
          <div className="container-wide">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <SectionLabel light>{neighbourhood.name}</SectionLabel>
                <h2 className="text-[32px] font-light text-white mt-5">
                  {t('attractionsOf', { name: neighbourhood.name })}
                </h2>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {neighbourhood.attractions.slice(0, 4).map((attraction, i) => (
                <AnimateOnScroll key={attraction.name} delay={i * 0.1}>
                  <div className="relative h-[224px] rounded overflow-hidden group">
                    <Image
                      src={attraction.image}
                      alt={attraction.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="text-white text-lg font-medium leading-tight">
                        {attraction.name}
                      </h3>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Invest */}
      {neighbourhood.whyInvest.length > 0 && (
        <section className="py-20 bg-black">
          <div className="container-wide">
            <div className="flex flex-col lg:flex-row items-start gap-16">
              {/* Left: Content */}
              <div className="flex-1">
                <AnimateOnScroll>
                  <h2 className="text-[32px] font-light text-white leading-[1.3] mb-8">
                    {t('whyInvestIn', { name: neighbourhood.name })}
                  </h2>
                  <p className="text-[#e2e2e2] text-base leading-[28px] tracking-[0.16px] mb-10">
                    {neighbourhood.description.split('\n')[0]}
                  </p>
                </AnimateOnScroll>
                <div className="space-y-6">
                  {neighbourhood.whyInvest.map((item, i) => (
                    <AnimateOnScroll key={item.title} delay={i * 0.1}>
                      <div>
                        <h3 className="text-white text-base font-semibold mb-1">
                          {item.title}
                        </h3>
                        <p className="text-[#e2e2e2] text-sm leading-[22px]">
                          {item.description}
                        </p>
                      </div>
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>

              {/* Right: Image */}
              <div className="flex-1 relative aspect-[605/631] w-full overflow-hidden rounded">
                <Image
                  src={neighbourhood.heroImage}
                  alt={`Why invest in ${neighbourhood.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
