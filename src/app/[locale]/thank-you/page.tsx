import type { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import SectionLabel from '@/components/ui/SectionLabel';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Your request has been successfully submitted. Our team will review your enquiry and get back to you shortly.',
  alternates: { canonical: 'https://blackoak-re.com/thank-you/' },
  openGraph: {
    title: 'Thank You | BlackOak Real Estate',
    description: 'Your request has been successfully submitted. Our team will get back to you shortly.',
    type: 'website',
    url: 'https://blackoak-re.com/thank-you/',
  },
  robots: { index: false, follow: false },
};

export default async function ThankYouPage() {
  const t = await getTranslations('pages.thankYou');

  return (
    <section className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4 max-w-xl">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <SectionLabel>{t('label')}</SectionLabel>
        <h1 className="text-3xl md:text-4xl font-semibold mt-4 mb-6">
          {t('heading')}
        </h1>
        <p className="text-gray-600 mb-2">
          {t('descriptionP1')}
        </p>
        <p className="text-gray-600 mb-2">
          {t('descriptionP2', { phone: t('phone') })}
        </p>
        <p className="text-gray-600 mb-8">
          {t('descriptionP3')}
        </p>
        <Button href="/" variant="outline">
          {t('cta')}
        </Button>
      </div>
    </section>
  );
}
