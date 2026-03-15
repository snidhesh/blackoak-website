import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Copy, Facebook, Linkedin, Instagram, Youtube } from 'lucide-react';
import { getNews, getNewsBySlug } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getNews().map((n) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getNewsBySlug(params.slug);
  if (!article) return { title: 'Not Found' };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function NewsDetailPage({ params }: Props) {
  const article = getNewsBySlug(params.slug);
  if (!article) notFound();

  const allNews = getNews();
  const related = allNews.filter((n) => n.slug !== article.slug).slice(0, 3);

  const formattedDate = new Date(article.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Split content in half to insert secondary image in between
  const contentParagraphs = article.content.split('</p>').filter(Boolean);
  const midpoint = Math.ceil(contentParagraphs.length / 2);
  const firstHalf = contentParagraphs.slice(0, midpoint).join('</p>') + '</p>';
  const secondHalf = contentParagraphs.slice(midpoint).join('</p>') + '</p>';

  return (
    <>
      {/* Header area */}
      <section className="pt-[152px] pb-0">
        <div className="max-w-[1094px] mx-auto px-6">
          {/* Back to News */}
          <Link
            href="/insights/news"
            className="inline-flex items-center gap-2 text-[14px] font-medium uppercase text-[#5f6368] hover:text-black transition-colors mb-[66px]"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            Back to News
          </Link>

          {/* Date */}
          <p className="text-[16px] font-medium leading-[26px] text-[#5f6368]">
            {formattedDate}
          </p>

          {/* Title */}
          <h1 className="text-[32px] md:text-[46px] font-normal leading-[1.3] md:leading-[60px] text-black mt-[10px]">
            {article.title}
          </h1>

          {/* Hero Image */}
          <div className="relative w-full aspect-[1094/755] mt-12 overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-10">
        <div className="max-w-[1094px] mx-auto px-6">
          <div
            className="text-[16px] font-normal leading-[26px] tracking-[0.16px] text-[#5f6368] [&>p]:mb-6"
            dangerouslySetInnerHTML={{ __html: firstHalf }}
          />

          {/* Secondary inline image */}
          {article.secondaryImage && (
            <div className="relative w-full md:w-[654px] aspect-[654/264] my-10 overflow-hidden">
              <Image
                src={article.secondaryImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div
            className="text-[16px] font-normal leading-[26px] tracking-[0.16px] text-[#5f6368] [&>p]:mb-6"
            dangerouslySetInnerHTML={{ __html: secondHalf }}
          />
        </div>
      </section>

      {/* Tags + Share */}
      <section className="pb-16">
        <div className="max-w-[1094px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-10">
            {/* Tags */}
            <div className="flex flex-col gap-[27px]">
              <p className="text-[18px] font-normal text-black opacity-60">Tags</p>
              <div className="flex gap-3 flex-wrap">
                {(article.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#5f6368] rounded-full px-5 py-[10px] h-[34px] flex items-center text-[14px] font-medium text-[#5f6368]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="flex flex-col gap-[27px]">
              <p className="text-[18px] font-normal text-black opacity-60">Share</p>
              <div className="flex gap-[18px] items-center">
                <button className="border border-[#5f6368] rounded-full px-[18px] h-[34px] flex items-center gap-[9px] text-[14px] font-medium uppercase text-black hover:bg-gray-50 transition-colors">
                  <Copy className="w-5 h-5" />
                  Copy
                </button>
                <div className="flex gap-3 items-center">
                  <Facebook className="w-[31px] h-[31px] text-[#5f6368] hover:text-black transition-colors cursor-pointer" />
                  <svg className="w-[31px] h-[31px] text-[#5f6368] hover:text-black transition-colors cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <Linkedin className="w-[31px] h-[31px] text-[#5f6368] hover:text-black transition-colors cursor-pointer" />
                  <svg className="w-[31px] h-[31px] text-[#5f6368] hover:text-black transition-colors cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.11-1.14l-.29-.174-3.01.79.81-2.95-.19-.31A7.96 7.96 0 014 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8z"/></svg>
                  <Instagram className="w-[31px] h-[31px] text-[#5f6368] hover:text-black transition-colors cursor-pointer" />
                  <Youtube className="w-[31px] h-[31px] text-[#5f6368] hover:text-black transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#ccc] mt-[60px]" />
        </div>
      </section>

      {/* Related News */}
      <section className="pb-20">
        <div className="container-narrow text-center mb-12">
          <AnimateOnScroll>
            <SectionLabel>Related News</SectionLabel>
            <SectionHeading
              title="Curated updates from the world of luxury real estate."
              className="mt-5 max-w-[488px] mx-auto"
            />
          </AnimateOnScroll>
        </div>

        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px]">
            {related.map((item, i) => (
              <AnimateOnScroll key={item.slug} delay={i * 0.1}>
                <Link href={`/insights/news/${item.slug}`}>
                  <article className="group cursor-pointer">
                    <div className="relative w-full aspect-[454/314] overflow-hidden mb-[18px]">
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
