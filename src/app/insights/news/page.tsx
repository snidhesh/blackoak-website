import type { Metadata } from 'next';
import Image from 'next/image';
import { getNews } from '@/lib/content';
import { formatDate } from '@/lib/formatters';
import SectionLabel from '@/components/ui/SectionLabel';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'News & Press',
  description: 'Latest news, market insights, and press releases from BlackOak Real Estate.',
};

export default function NewsPage() {
  const news = getNews();

  return (
    <>
      <section className="pt-24 pb-10">
        <div className="container-narrow text-center">
          <SectionLabel>NEWS & PRESS</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-semibold mt-4">News & Press</h1>
          <p className="mt-4 text-gray-600">
            Stay informed with the latest market insights, company news, and industry updates from BlackOak Real Estate.
          </p>
        </div>
      </section>

      <section className="py-10 pb-20">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, i) => (
              <AnimateOnScroll key={item.slug} delay={i * 0.1}>
                <article className="group">
                  <div className="relative aspect-[16/10] bg-gray-200 overflow-hidden mb-4">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs text-gold font-medium uppercase">{item.category}</span>
                    <h2 className="text-lg font-semibold group-hover:text-gray-600 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.excerpt}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.publishedDate)}</p>
                  </div>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
