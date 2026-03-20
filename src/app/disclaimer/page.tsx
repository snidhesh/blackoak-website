import type { Metadata } from 'next';
import disclaimerData from '@/content/disclaimer.json';

export const metadata: Metadata = {
  title: 'Disclaimer - Important Notices',
  description:
    'Important disclaimers regarding BlackOak Real Estate property listings, market information, and advisory services in Dubai.',
  alternates: { canonical: 'https://blackoak-re.com/disclaimer/' },
  openGraph: {
    title: 'Disclaimer | BlackOak Real Estate',
    description:
      'Important disclaimers regarding BlackOak Real Estate property listings, market information, and advisory services.',
    type: 'website',
    url: 'https://blackoak-re.com/disclaimer/',
  },
};

export default function DisclaimerPage() {
  return (
    <section className="pt-24 pb-20">
      <div className="container-narrow">
        {disclaimerData.sections.map((section, i) => (
          <div key={i} className={i > 0 ? 'mt-10' : ''}>
            {i === 0 ? (
              <h1 className="text-4xl font-semibold mb-6">{section.title}</h1>
            ) : (
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            )}
            <div className="text-gray-600 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
