import type { Metadata } from 'next';
import { CheckCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import Button from '@/components/ui/Button';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.thankYou' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: 'https://blackoak-re.com/thank-you/' },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      url: 'https://blackoak-re.com/thank-you/',
    },
    robots: { index: false, follow: false },
  };
}

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
