import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getNews } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Dubai Real Estate News & Market Insights',
  description:
    'Latest Dubai real estate news, market reports & investment insights from BlackOak. Stay informed on property trends, regulations & opportunities in the UAE.',
  alternates: { canonical: 'https://blackoak-re.com/insights/news' },
  openGraph: {
    title: 'Dubai Real Estate News & Market Insights | BlackOak',
    description:
      'Latest Dubai real estate news, market reports & investment insights from BlackOak. Stay informed on property trends & opportunities.',
    type: 'website',
    url: 'https://blackoak-re.com/insights/news',
    images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: 'Dubai Real Estate News' }],
  },
};

export default function NewsPage() {
  const news = getNews();
  const featured = news[0];
  const gridArticles = news.slice(1);

  return (
    <>
      {/* Featured Article */}
      <section className="pt-[156px] pb-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Image */}
              <Link href={`/insights/news/${featured.slug}`} className="relative w-full lg:w-[691px] aspect-[691/478] overflow-hidden shrink-0">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                  priority
                />
              </Link>

              {/* Content */}
              <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-9">
                  <p className="text-[16px] font-medium leading-[26px] text-[#5f6368]">
                    {new Date(featured.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex flex-col gap-8">
                    <h1 className="text-[40px] font-semibold leading-[48px] text-black max-w-[509px]">
                      {featured.title}
                    </h1>
                    <p className="text-[16px] font-normal leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[496px]">
                      {featured.excerpt}
                    </p>
                  </div>
                </div>
                <Link href={`/insights/news/${featured.slug}`} className="flex items-center gap-[7px] group">
                  <span className="text-[14px] font-medium uppercase text-black tracking-wide">
                    Read&nbsp;&nbsp;More
                  </span>
                  <ArrowUpRight className="w-6 h-6 text-[#5f6368]" />
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Latest News Label + Heading */}
      <section className="py-8">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>Latest News</SectionLabel>
            <SectionHeading
              title="Curated perspectives on the UAE's most dynamic real estate landscape."
              className="mt-5 max-w-[556px] mx-auto"
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-10 pb-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {gridArticles.map((item, i) => (
              <AnimateOnScroll key={item.slug} delay={(i % 3) * 0.1}>
                <Link href={`/insights/news/${item.slug}`}>
                  <article className="group cursor-pointer">
                    <div className="relative w-full aspect-[442/310] overflow-hidden mb-[18px]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-col gap-[10px] max-w-[433px]">
                      <div className="flex flex-col">
                        <p className="text-[12px] font-medium leading-[30px] text-[#5f6368]">
                          {new Date(item.publishedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <h2 className="text-[20px] font-semibold leading-[30px] text-black">
                          {item.title}
                        </h2>
                      </div>
                      <p className="text-[14px] font-medium leading-[20px] text-[#5f6368] line-clamp-3">
                        {item.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
