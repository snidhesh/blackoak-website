import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getNews } from '@/lib/content';
import { formatDate } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.news' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Dubai real estate news', 'Dubai property market updates', 'Dubai real estate trends', 'luxury property market Dubai', 'Dubai property reports', 'UAE real estate insights'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/insights/news/' : `https://blackoak-re.com/${locale}/insights/news/`,
      languages: { en: 'https://blackoak-re.com/insights/news/', fr: 'https://blackoak-re.com/fr/insights/news/', ar: 'https://blackoak-re.com/ar/insights/news/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/insights/news/' : `https://blackoak-re.com/${locale}/insights/news/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

export default async function NewsPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations('pages.insights.news');
  const news = getNews(locale);
  const featured = news[0];
  const gridArticles = news.slice(1);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.insights'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/insights/news/` },
      { '@type': 'ListItem', position: 3, name: t('breadcrumbs.news'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/insights/news/` },
    ],
  };

  const newsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Dubai Real Estate News & Market Insights',
    description: 'Latest Dubai real estate news, market reports & investment insights from BlackOak Real Estate.',
    url: locale === 'en' ? 'https://blackoak-re.com/insights/news/' : `https://blackoak-re.com/${locale}/insights/news/`,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'BlackOak Real Estate',
      logo: { '@type': 'ImageObject', url: 'https://blackoak-re.com/images/logo-white.png' },
    },
    blogPost: news.map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.publishedDate,
      inLanguage: locale,
      image: article.image ? `https://blackoak-re.com${article.image}` : undefined,
      url: locale === 'en' ? `https://blackoak-re.com/insights/news/${article.slug}/` : `https://blackoak-re.com/${locale}/insights/news/${article.slug}/`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }}
      />
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
                    {formatDate(featured.publishedDate, locale)}
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
                    {t('readMore')}
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
            <SectionLabel>{t('latestNewsLabel')}</SectionLabel>
            <SectionHeading
              title={t('latestNewsHeading')}
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
                          {formatDate(item.publishedDate, locale)}
                        </p>
                        <h3 className="text-[20px] font-semibold leading-[30px] text-black">
                          {item.title}
                        </h3>
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
