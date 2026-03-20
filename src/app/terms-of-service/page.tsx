import type { Metadata } from 'next';
import termsData from '@/content/terms-of-service.json';

export const metadata: Metadata = {
  title: 'Terms of Service - User Agreement',
  description:
    'Terms and conditions governing your use of BlackOak Real Estate services and website. Read our policies on property transactions, liability, and user obligations.',
  alternates: { canonical: 'https://blackoak-re.com/terms-of-service/' },
  openGraph: {
    title: 'Terms of Service | BlackOak Real Estate',
    description:
      'Terms and conditions governing your use of BlackOak Real Estate services and website.',
    type: 'website',
    url: 'https://blackoak-re.com/terms-of-service/',
  },
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
