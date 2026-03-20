import type { Metadata } from 'next';
import privacyData from '@/content/privacy-policy.json';

export const metadata: Metadata = {
  title: 'Privacy Policy - Your Data Rights',
  description:
    'Learn how BlackOak Real Estate collects, uses, and protects your personal data. Our commitment to privacy and transparency in Dubai luxury real estate services.',
  alternates: { canonical: 'https://blackoak-re.com/privacy-policy/' },
  openGraph: {
    title: 'Privacy Policy | BlackOak Real Estate',
    description:
      'Learn how BlackOak Real Estate collects, uses, and protects your personal data.',
    type: 'website',
    url: 'https://blackoak-re.com/privacy-policy/',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="pt-24 pb-20">
      <div className="container-narrow">
        {privacyData.sections.map((section, i) => (
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
