import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, ArrowUpRight, MapPin, Home, ChevronDown, BedDouble, Maximize2 } from 'lucide-react';
import { getFeaturedProjects, getNeighbourhoods, getNews } from '@/lib/content';
import { formatDate, formatPriceNumber } from '@/lib/formatters';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import DirhamIcon from '@/components/ui/DirhamIcon';
import Button from '@/components/ui/Button';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import homepage from '@/content/homepage.json';
import splash from '@/content/splash.json';

const SplashScreen = dynamic(
  () => import('@/components/shared/SplashScreen'),
  { ssr: false }
);

export const revalidate = 300;

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects();
  const homepageNeighbourhoodSlugs = [
    'palm-jumeirah', 'dubai-hills-estate', 'al-barari', 'downtown-dubai',
    'jumeirah-golf-estates', 'dubai-marina', 'city-walk', 'business-bay',
  ];
  const allNeighbourhoods = getNeighbourhoods();
  const neighbourhoods = homepageNeighbourhoodSlugs
    .map(slug => allNeighbourhoods.find(n => n.slug === slug))
    .filter(Boolean) as typeof allNeighbourhoods;
  const news = getNews().slice(0, 3);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BlackOak Real Estate',
    url: 'https://blackoak-re.com',
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={homepage.hero.image}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/homepage/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-[36px] md:text-[50px] font-light leading-[1.1]">
            {homepage.hero.heading}
          </h1>
          <p className="mt-4 text-[16px] font-normal text-white">
            {homepage.hero.subtitle}
          </p>

          {/* Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto">
            <Link
              href="/projects"
              className="flex items-center bg-white rounded overflow-hidden shadow-lg text-left h-[60px]"
            >
              <div className="flex-1 grid grid-cols-3 divide-x divide-gray-200 h-full">
                <div className="px-5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#5F6368] shrink-0" />
                  <span className="text-[13px] font-medium text-[#5F6368]">
                    {homepage.hero.searchBar.placeholders.location}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#5F6368] ml-auto shrink-0" />
                </div>
                <div className="px-5 flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#5F6368] shrink-0" />
                  <span className="text-[13px] font-medium text-[#5F6368]">
                    {homepage.hero.searchBar.placeholders.propertyType}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#5F6368] ml-auto shrink-0" />
                </div>
                <div className="px-5 flex items-center gap-2">
                  <DirhamIcon size={14} className="shrink-0 opacity-60" />
                  <span className="text-[13px] font-medium text-[#5F6368]">
                    {homepage.hero.searchBar.placeholders.price}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#5F6368] ml-auto shrink-0" />
                </div>
              </div>
              <div className="bg-black px-5 flex items-center justify-center self-stretch">
                <span className="text-white text-[12px] font-medium tracking-wider uppercase">
                  {homepage.hero.searchBar.buttonText}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>{homepage.featuredProjects.label}</SectionLabel>
            <SectionHeading
              title={homepage.featuredProjects.heading}
              className="mt-4 mb-12"
            />
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((project, i) => (
              <AnimateOnScroll
                key={project.slug}
                delay={i * 0.08}
                className={i === 0 ? 'lg:col-span-2' : ''}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="group relative block overflow-hidden"
                >
                  <div className="relative h-[260px] md:h-[332px]">
                    <Image
                      src={project.mainImage}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes={i === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Arrow icon top-right */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="inline-block bg-black/60 text-white text-[10px] font-medium tracking-[0.2px] uppercase leading-[15px] px-3 py-1 rounded-sm mb-3">
                        {project.propertyType}
                      </span>
                      <p className="text-white font-semibold text-[28px] leading-[20px] flex items-center gap-2">
                        <DirhamIcon size={18} className="invert" />
                        {formatPriceNumber(project.price)}
                      </p>
                      <p className="text-white/80 font-light text-[16px] leading-[40px]">{project.name}</p>

                      {/* Hover details row */}
                      <div className="flex items-center gap-4 text-white/80 text-[12px] font-normal max-h-0 overflow-hidden opacity-0 group-hover:max-h-[40px] group-hover:opacity-100 transition-all duration-300 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {project.location.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <BedDouble className="w-3 h-3" />
                          {project.bedrooms} Bedrooms
                        </span>
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3 h-3" />
                          {project.area.toLocaleString('en-US')} {project.areaUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button href={homepage.featuredProjects.cta.href} variant="outline">
              {homepage.featuredProjects.cta.label} <ArrowRight className="w-4 h-4 ml-2" />
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                    sizes="(max-width: 768px) 50vw, 25vw"
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

          {/* Trusted Partners */}
          <div className="mt-20">
            <AnimateOnScroll>
              <h2 className="text-center text-[28px] md:text-[32px] font-light leading-[48px] text-white mb-10">
                {homepage.partners.heading}
              </h2>
            </AnimateOnScroll>
            <div className="relative overflow-hidden">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-10" />
              <div className="flex animate-marquee">
                {[...homepage.partners.logos, ...homepage.partners.logos].map((partner, i) => (
                  <div key={`${partner.name}-${i}`} className="h-[115px] w-[115px] flex-shrink-0 mx-8 flex items-center justify-center">
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
      </section>

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
                Original
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
                    {homepage.about.cta.label} <ArrowRight className="w-4 h-4 ml-2" />
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((article, i) => (
              <AnimateOnScroll key={article.slug} delay={(i + 1) * 0.1}>
                <Link href="/insights/news" className="group block">
                  <div className="relative aspect-[454/314] bg-gray-200 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-[12px] font-medium leading-[30px] text-[#5F6368]">
                      {formatDate(article.publishedDate)}
                    </p>
                    <h3 className="font-semibold text-[20px] leading-[30px] text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="font-medium text-[14px] leading-[20px] text-[#5F6368] line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button href={homepage.news.cta.href} variant="outline">
              {homepage.news.cta.label} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Media Logos */}
      <section className="py-12 bg-white">
        <div className="container-wide">
          <div className="flex justify-center items-center gap-6 sm:gap-10 md:gap-14 overflow-hidden">
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
