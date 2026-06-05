import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { getNeighbourhoods, getNews, getInternationalCountries } from '@/lib/content';
import { formatDate } from '@/lib/formatters';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import FeaturedProjectsGrid, { FeaturedProjectsSkeleton } from '@/components/sections/FeaturedProjectsGrid';
import HomeSearchBar from '@/components/ui/HomeSearchBar';
import Button from '@/components/ui/Button';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import InternationalMarketsStack, { type MarketEntry } from '@/components/sections/InternationalMarketsStack';
import { getHomepage, getSplash } from '@/lib/content';
import type { Locale } from '@/i18n/config';

const SplashScreen = dynamic(
  () => import('@/components/shared/SplashScreen'),
  { ssr: false }
);

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Dubai luxury real estate', 'luxury properties Dubai', 'buy villa Dubai', 'apartments for sale Dubai', 'Palm Jumeirah property', 'Emirates Hills mansions', 'Dubai property investment', 'off-plan Dubai', 'BlackOak Real Estate', 'luxury penthouses Dubai Marina'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/' : `https://blackoak-re.com/${locale}/`,
      languages: { en: 'https://blackoak-re.com/', fr: 'https://blackoak-re.com/fr/', ar: 'https://blackoak-re.com/ar/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/' : `https://blackoak-re.com/${locale}/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogImageAlt') }],
    },
  };
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const homepage = getHomepage(locale);
  const splash = getSplash(locale);
  const homepageNeighbourhoodSlugs = [
    'palm-jumeirah', 'dubai-hills-estate', 'al-barari', 'downtown-dubai',
    'jumeirah-golf-estates', 'dubai-marina', 'city-walk', 'business-bay',
  ];
  const allNeighbourhoods = getNeighbourhoods(locale);
  const neighbourhoods = homepageNeighbourhoodSlugs
    .map(slug => allNeighbourhoods.find(n => n.slug === slug))
    .filter(Boolean) as typeof allNeighbourhoods;
  const news = getNews(locale).slice(0, 3);
  const internationalCountries = getInternationalCountries(locale);
  // Maldives leads (our flagship listing); everything else follows the data order.
  const maldives = internationalCountries.find((c) => c.countryCode === 'MV');
  const otherCountries = internationalCountries.filter((c) => c.countryCode !== 'MV');
  const orderedCountries = maldives ? [maldives, ...otherCountries] : internationalCountries;
  const exploreMoreLabel = tCommon('exploreMore');
  const homepageMarketEntries: MarketEntry[] = orderedCountries.map((c) => ({
    name: c.name,
    country: c.region === 'europe' ? 'Europe' : c.region === 'asia' ? 'Asia & Indian Ocean' : 'Americas',
    focus: c.shortFocus,
    image: c.heroImage,
    status: 'active',
    href: '/international-properties',
    ctaLabel: exploreMoreLabel,
  }));

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BlackOak Real Estate',
    url: 'https://blackoak-re.com',
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://blackoak-re.com/projects?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      {splash.enabled && <SplashScreen {...splash} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            name: homepage.hero.heading,
            description: homepage.hero.subtitle,
            thumbnailUrl: `https://blackoak-re.com${homepage.hero.image}`,
            contentUrl: 'https://blackoak-re.com/images/homepage/hero.mp4',
            uploadDate: '2024-01-01',
            publisher: {
              '@type': 'Organization',
              name: 'BlackOak Real Estate',
              logo: {
                '@type': 'ImageObject',
                url: 'https://blackoak-re.com/images/logo-white.png',
              },
            },
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={homepage.hero.image}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/homepage/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-[36px] md:text-[50px] font-light leading-[1.2]">
            {homepage.hero.heading}
          </h1>
          <p className="mt-4 text-[16px] font-normal text-white">
            {homepage.hero.subtitle}
          </p>

          {/* Search Bar */}
          <div className="mt-10">
            <HomeSearchBar
              neighbourhoods={allNeighbourhoods.map(n => ({ value: n.slug, label: n.name }))}
            />
          </div>
        </div>
      </section>

      {/* Featured Projects (Developer Boxes) */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>{homepage.featuredDevelopers.label}</SectionLabel>
            <SectionHeading
              title={homepage.featuredDevelopers.heading}
              className="mt-4 mb-12"
            />
          </AnimateOnScroll>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {homepage.featuredDevelopers.projects.map((project: { developer: string; name: string; logo: string | null; image: string; href: string }, i: number) => (
              <AnimateOnScroll key={project.developer} delay={i * 0.06}>
                <div className="group relative overflow-hidden aspect-square md:aspect-[3/4]">
                  {/* Background image */}
                  <Image
                    src={project.image}
                    alt={`${project.developer} – ${project.name}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Default state: dark overlay + developer logo centered */}
                  <div className="absolute inset-0 bg-black/50 transition-opacity duration-500 group-hover:opacity-0" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 md:p-6 transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-2">
                    <div className="relative w-[100px] h-[40px] md:w-[200px] md:h-[75px]">
                      <Image
                        src={project.logo!}
                        alt={project.developer}
                        fill
                        className="object-contain brightness-0 invert"
                      />
                    </div>
                  </div>

                  {/* Hover state: gradient overlay + project name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <div className="w-6 md:w-10 h-px bg-white/60 mb-2 md:mb-3" />
                    <p className="text-white text-[12px] md:text-[18px] font-medium leading-[16px] md:leading-[26px] tracking-wide line-clamp-2">
                      {project.name}
                    </p>
                    <p className="text-white/60 text-[10px] md:text-[12px] font-light tracking-[1.5px] uppercase mt-1">
                      {tCommon('by', { name: project.developer })}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>{homepage.featuredProjects.label}</SectionLabel>
            <SectionHeading
              title={homepage.featuredProjects.heading}
              className="mt-4 mb-12"
            />
          </AnimateOnScroll>

          <Suspense fallback={<FeaturedProjectsSkeleton />}>
            <FeaturedProjectsGrid locale={locale} />
          </Suspense>

          <div className="text-center mt-10">
            <Button href={homepage.featuredProjects.cta.href} variant="outline">
              {homepage.featuredProjects.cta.label} <ArrowRight className="w-4 h-4 ms-2 icon-directional" />
            </Button>
          </div>
        </div>
      </section>

      {/* Neighbourhoods + Trusted Partners (shared dark background) */}
      <section className="py-20 bg-black text-white">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel light>{homepage.neighbourhoods.label}</SectionLabel>
            <h2 className="text-center text-[28px] md:text-[32px] font-light leading-[48px] text-white mt-4 mb-12">
              {homepage.neighbourhoods.heading}
            </h2>
          </AnimateOnScroll>

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-4 gap-2">
            {neighbourhoods.map((n, i) => (
              <AnimateOnScroll key={n.slug} delay={i * 0.08}>
                <Link
                  href={`/neighbourhoods/${n.slug}`}
                  className="group relative block aspect-[3/2] overflow-hidden"
                >
                  <Image
                    src={n.heroImage}
                    alt={n.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white/80 font-light text-[16px] leading-[40px]">{n.name}</h3>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Mobile horizontal scroll */}
          <div className="md:hidden relative">
            <div className="absolute left-0 top-[97px] w-[10px] h-[58px] bg-white rounded-r z-10" />
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide ps-5 pe-5">
              {neighbourhoods.map((n) => (
                <Link
                  key={n.slug}
                  href={`/neighbourhoods/${n.slug}`}
                  className="group relative flex-shrink-0 w-[85vw] aspect-[3/2] overflow-hidden snap-start"
                >
                  <Image
                    src={n.heroImage}
                    alt={n.name}
                    fill
                    className="object-cover"
                    sizes="85vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                    <h3 className="text-white font-light text-[20px] leading-[28px]">{n.name}</h3>
                    <ArrowUpRight className="w-5 h-5 text-white shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Trusted Partners */}
          <div className="mt-20">
            <AnimateOnScroll>
              <h2 className="text-center text-[28px] md:text-[32px] font-light leading-[48px] text-white mb-6">
                {homepage.partners.heading}
              </h2>
            </AnimateOnScroll>
            <div className="relative overflow-hidden">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10" />
              <div className="flex animate-marquee will-change-transform">
                <div className="flex shrink-0">
                  {homepage.partners.logos.map((partner: { name: string; image: string }) => (
                    <div key={partner.name} className="h-[85px] w-[115px] flex-shrink-0 mx-6 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="h-full w-full object-contain brightness-0 invert"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex shrink-0" aria-hidden="true">
                  {homepage.partners.logos.map((partner: { name: string; image: string }) => (
                    <div key={partner.name} className="h-[85px] w-[115px] flex-shrink-0 mx-6 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="h-full w-full object-contain brightness-0 invert"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* International Properties — horizontal stack slider over all destinations.
          Maldives leads; every panel links to /international-properties with the same CTA. */}
      <InternationalMarketsStack
        entries={homepageMarketEntries}
        eyebrow={homepage.internationalProperties.label}
        heading={homepage.internationalProperties.heading}
        showStatus={false}
      />

      {/* BlackOak Advantage */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>{homepage.advantage.label}</SectionLabel>
            <SectionHeading
              title={homepage.advantage.heading}
              className="mt-4 mb-12"
            />
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homepage.advantage.cards.map((card, i) => {
              const parts = card.title.split('BlackOak ');
              const serviceName = parts.length > 1 ? parts[1] : card.title;
              return (
                <AnimateOnScroll key={card.title} delay={i * 0.15}>
                  <div className="group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(3,3,3,0.8)] via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-white font-light text-[20px] leading-[28px]">BlackOak</p>
                        <h3 className="text-white font-light text-[36px] md:text-[50px] leading-[1.1]">{serviceName}</h3>
                      </div>
                    </div>
                    <p className="font-normal text-[20px] leading-[28px] text-[#5F6368] mt-5">{card.description}</p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* STARZPLAY Section */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Vertical STARZPLAY watermark on the right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/3 opacity-[0.06] pointer-events-none hidden lg:block">
          <Image
            src={homepage.starzplay.logo}
            alt=""
            width={276}
            height={1021}
            className="rotate-90 origin-center scale-[3]"
            aria-hidden="true"
          />
        </div>

        <div className="container-wide relative z-10 py-20">
          <AnimateOnScroll>
            <SectionLabel light>{homepage.starzplay.label}</SectionLabel>
            <SectionHeading
              title={homepage.starzplay.heading}
              light
              className="mt-4"
            />
            <p className="text-center font-light text-[16px] leading-[28px] text-white/80 max-w-3xl mx-auto mt-3 mb-12">
              {homepage.starzplay.subheading}
            </p>
          </AnimateOnScroll>

          {/* Logo + ORIGINAL */}
          <AnimateOnScroll>
            <div className="flex items-center justify-center gap-4 mb-10">
              <Image
                src={homepage.starzplay.logo}
                alt="STARZPLAY"
                width={245}
                height={66}
                className="h-[40px] md:h-[50px] w-auto object-contain"
              />
              <span className="font-light text-[32px] md:text-[42px] leading-[48px] uppercase text-[#FCF4D5]">
                {tCommon('original')}
              </span>
            </div>
          </AnimateOnScroll>

          {/* Two poster images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1040px] mx-auto">
            {homepage.starzplay.posters.map((url: string, i: number) => (
              <AnimateOnScroll key={i} delay={i * 0.15}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={url}
                    alt={`Million Dollar Listing ${i === 0 ? 'Season 1' : 'Season 2'}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Production logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-14">
            {homepage.starzplay.productionLogos.map((logo: { name: string; image: string; width: number; height: number }) => (
              <div key={logo.name} className="relative w-[90px] h-[50px] md:w-[110px] md:h-[65px] flex items-center justify-center">
                <Image
                  src={logo.image}
                  alt={logo.name}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest in BlackOak */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-[32px] md:text-[42px] font-normal leading-[48px]">
                {homepage.whyInvest.heading}
              </h2>
              <p className="mt-4 font-normal text-[18px] leading-[26px] text-[#5F6368]">
                {homepage.whyInvest.description}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {homepage.whyInvest.cards.map((card, i) => (
              <AnimateOnScroll key={card.title} delay={i * 0.15}>
                <div className="bg-[#E2E2E2] rounded-lg p-8 h-full">
                  <div className="w-12 h-12 mb-5 flex items-center justify-center">
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={42}
                      height={42}
                    />
                  </div>
                  <h3 className="font-bold text-[20px] leading-[26px] mb-2">{card.title}</h3>
                  <p className="font-normal text-[14px] leading-[20px] text-[#5F6368]">{card.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* About BlackOak */}
      <section>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <AnimateOnScroll>
              <div className="relative aspect-square bg-gray-200 overflow-hidden">
                <Image
                  src={homepage.about.image}
                  alt="About BlackOak"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="bg-black text-white p-10 md:p-16 flex flex-col justify-center h-full">
                <SectionLabel light className="justify-start [&::before]:bg-gray-500 [&::after]:bg-gray-500 text-gray-400">{homepage.about.label}</SectionLabel>
                <h2 className="text-[32px] md:text-[42px] font-light leading-[55px] text-white mt-4 mb-6">
                  {homepage.about.heading}
                </h2>
                <p className="font-normal text-[18px] leading-[30px] text-white/80 mb-6">
                  {homepage.about.description}
                </p>
                <div>
                  <Button href={homepage.about.cta.href} variant="outline-light">
                    {homepage.about.cta.label} <ArrowRight className="w-4 h-4 ms-2 icon-directional" />
                  </Button>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* In the Media */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>{homepage.news.label}</SectionLabel>
            <SectionHeading
              title={homepage.news.heading}
              className="mt-4 mb-12"
            />
          </AnimateOnScroll>

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {news.map((article, i) => (
              <AnimateOnScroll key={article.slug} delay={(i + 1) * 0.1}>
                <Link href={`/insights/news/${article.slug}`} className="group block">
                  <div className="relative aspect-[454/314] bg-gray-200 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="33vw"
                    />
                  </div>
                  <article className="mt-4 space-y-2">
                    <p className="text-[12px] font-medium leading-[30px] text-[#5F6368]">
                      <time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
                    </p>
                    <h3 className="font-semibold text-[20px] leading-[30px] text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="font-medium text-[14px] leading-[20px] text-[#5F6368] line-clamp-2">
                      {article.excerpt}
                    </p>
                  </article>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Mobile horizontal scroll */}
          <div className="md:hidden relative">
            <div className="absolute left-0 top-[120px] w-[10px] h-[58px] bg-black rounded-r z-10" />
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide ps-5 pe-5">
              {news.map((article) => (
                <Link
                  key={article.slug}
                  href={`/insights/news/${article.slug}`}
                  className="group flex-shrink-0 w-[85vw] snap-start"
                >
                  <div className="relative aspect-[454/314] bg-gray-200 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="85vw"
                    />
                  </div>
                  <article className="mt-4 space-y-2">
                    <p className="text-[12px] font-medium leading-[30px] text-[#5F6368]">
                      <time dateTime={article.publishedDate}>{formatDate(article.publishedDate)}</time>
                    </p>
                    <h3 className="font-semibold text-[18px] leading-[26px] text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="font-medium text-[14px] leading-[20px] text-[#5F6368] line-clamp-2">
                      {article.excerpt}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Button href={homepage.news.cta.href} variant="outline">
              {homepage.news.cta.label} <ArrowRight className="w-4 h-4 ms-2 icon-directional" />
            </Button>
          </div>
        </div>
      </section>

      {/* Media Logos */}
      <section className="py-12 bg-white">
        <div className="container-wide">
          <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto scrollbar-hide">
            {homepage.mediaLogos.map((logo) => (
              <div key={logo.name} className="relative h-6 w-[80px] sm:w-[100px] md:w-[120px] shrink-0 flex items-center justify-center">
                <Image
                  src={logo.image}
                  alt={logo.name}
                  fill
                  className="object-contain opacity-60"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
