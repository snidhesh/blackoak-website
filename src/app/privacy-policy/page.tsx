import type { Metadata } from 'next';
import privacyData from '@/content/privacy-policy.json';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'BlackOak Real Estate privacy policy.',
};

export default function PrivacyPolicyPage() {
  return (
    <section className="pt-24 pb-20">
      <div className="container-narrow">
        {privacyData.sections.map((section, i) => (
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
