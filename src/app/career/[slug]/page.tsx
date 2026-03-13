import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, MapPin, CheckCircle2 } from 'lucide-react';
import { getCareers, getCareerBySlug } from '@/lib/content';
import { formatDate } from '@/lib/formatters';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import CareerApplicationForm from './CareerApplicationForm';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getCareers().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const job = getCareerBySlug(params.slug);
  if (!job) return { title: 'Not Found' };
  return {
    title: `${job.title} - Career`,
    description: job.description.slice(0, 160),
  };
}

export default function CareerDetailPage({ params }: Props) {
  const job = getCareerBySlug(params.slug);
  if (!job) notFound();

  return (
    <>
      <section className="pt-24 pb-10">
        <div className="container-wide">
          <Link href="/career" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6">
            <ArrowLeft className="w-4 h-4" /> BACK TO PAGE
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                <span>{job.department}</span>
                <span>Posted on: {formatDate(job.postedDate)}</span>
              </div>
            </div>
            <Button href="#apply-form" size="md">APPLY NOW</Button>
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
                <span className="font-medium w-44 flex-shrink-0">Remuneration</span>
                <span className="text-gray-600">{job.remuneration}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium w-44 flex-shrink-0">Benefits</span>
                <span className="text-gray-600">{job.benefits}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium w-44 flex-shrink-0">Location</span>
                <span className="text-gray-600">{job.locationDetail}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium w-44 flex-shrink-0">Number of Positions</span>
                <span className="text-gray-600">{job.numberOfPositions}</span>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-10">
        <div className="container-wide">
          <AnimateOnScroll>
            <h2 className="text-xl font-semibold mb-6">Key Responsibilities</h2>
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
            <SectionLabel>APPLY NOW</SectionLabel>
            <SectionHeading
              title="Ready to Elevate Your Career to the Next Level?"
              className="mt-4 mb-10"
            />
          </AnimateOnScroll>
          <CareerApplicationForm jobSlug={job.slug} jobTitle={job.title} />
        </div>
      </section>
    </>
  );
}
