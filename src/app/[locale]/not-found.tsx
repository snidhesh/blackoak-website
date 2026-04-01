import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

export default function NotFound() {
  const t = useTranslations('pages.notFound');

  return (
    <section className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-8xl font-bold text-gray-200 mb-4">{t('code')}</h1>
        <h2 className="text-2xl font-semibold mb-4">{t('heading')}</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t('description')}
        </p>
        <Button href="/" variant="outline">
          {t('cta')}
        </Button>
      </div>
    </section>
  );
}
