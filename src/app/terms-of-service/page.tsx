import type { Metadata } from 'next';
import termsData from '@/content/terms-of-service.json';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'BlackOak Real Estate terms of service.',
};

export default function TermsOfServicePage() {
  return (
    <section className="pt-24 pb-20">
      <div className="container-narrow">
        {termsData.sections.map((section, i) => (
          <div key={i} className={i > 0 ? 'mt-10' : ''}>
            <h1 className={i === 0 ? 'text-4xl font-semibold mb-6' : 'text-2xl font-semibold mb-4'}>
              {section.title}
            </h1>
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
