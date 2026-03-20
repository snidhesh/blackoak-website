import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getNeighbourhoods, getNeighbourhoodBySlug, getProjectsByNeighbourhood } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import PropertyGrid from '@/components/sections/PropertyGrid';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  const neighbourhoods = getNeighbourhoods();
  return neighbourhoods.map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const neighbourhood = getNeighbourhoodBySlug(params.slug);
  if (!neighbourhood) return { title: 'Not Found' };
  return {
    title: neighbourhood.seo.title,
    description: neighbourhood.seo.description,
    openGraph: {
      title: neighbourhood.seo.title,
      description: neighbourhood.seo.description,
      type: 'website',
      url: `https://blackoak-re.com/neighbourhoods/${params.slug}/`,
      images: [{ url: neighbourhood.heroImage, alt: `${neighbourhood.name} - Dubai` }],
    },
    alternates: {
      canonical: `https://blackoak-re.com/neighbourhoods/${params.slug}/`,
    },
  };
}

export const revalidate = 300;

export default async function NeighbourhoodPage({ params }: Props) {
  const neighbourhood = getNeighbourhoodBySlug(params.slug);
  if (!neighbourhood) notFound();

  const projects = await getProjectsByNeighbourhood(params.slug);

  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: neighbourhood.name,
    description: neighbourhood.seo.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: neighbourhood.name,
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    image: neighbourhood.heroImage,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://blackoak-re.com' },
      { '@type': 'ListItem', position: 2, name: 'Neighbourhoods', item: 'https://blackoak-re.com' },
      { '@type': 'ListItem', position: 3, name: neighbourhood.name, item: `https://blackoak-re.com/neighbourhoods/${params.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
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
              <SectionLabel>About {neighbourhood.name}</SectionLabel>
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
                Properties in {neighbourhood.name}
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
                  Attractions of {neighbourhood.name}
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
                    Why Invest in Luxury Property in {neighbourhood.name}?
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
