import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { getSplash } from '@/lib/content';
import type { Locale } from '@/i18n/config';

const BASE_URL = 'https://blackoak-re.com';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = params.locale;
  const ogLocale = locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE';

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: 'BlackOak Real Estate | Luxury Properties & Investment in Dubai',
      template: '%s | BlackOak Real Estate',
    },
    description:
      'Dubai luxury real estate specialists. Buy villas, apartments & penthouses in Palm Jumeirah, Emirates Hills, Downtown Dubai & more. Expert investment advisory & concierge services.',
    keywords: [
      'Dubai real estate',
      'luxury properties Dubai',
      'buy property in Dubai',
      'Dubai property investment',
      'luxury villas Dubai',
      'apartments for sale Dubai',
      'Palm Jumeirah villas',
      'Emirates Hills mansions',
      'Dubai Hills Estate',
      'Downtown Dubai apartments',
      'off-plan property Dubai',
      'Dubai real estate agent',
      'luxury penthouses Dubai Marina',
      'property investment UAE',
      'BlackOak Real Estate',
      'Dubai Golden Visa property',
      'branded residences Dubai',
      'waterfront property Dubai',
    ],
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: locale === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${locale}/`,
      siteName: 'BlackOak Real Estate',
      images: [
        {
          url: `${BASE_URL}/images/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: 'BlackOak Real Estate - Luxury Properties in Dubai',
        },
      ],
    },
    alternates: {
      canonical: locale === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${locale}/`,
      languages: {
        'x-default': `${BASE_URL}/`,
        en: `${BASE_URL}/`,
        fr: `${BASE_URL}/fr/`,
        ar: `${BASE_URL}/ar/`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // Validate locale
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const splash = getSplash(locale as Locale);

  return (
    <NextIntlClientProvider messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: 'BlackOak Real Estate',
            url: BASE_URL,
            logo: `${BASE_URL}/images/logo-white.png`,
            description:
              'A global luxury real estate firm delivering expert guidance, exclusive opportunities, and tailored investment services in Dubai.',
            inLanguage: locale,
            telephone: '+971 4 398 9055',
            email: 'info@blackoak-re.com',
            address: [
              {
                '@type': 'PostalAddress',
                streetAddress: 'Office 1406, Marina Plaza, Dubai Marina',
                addressLocality: 'Dubai',
                addressCountry: 'AE',
              },
              {
                '@type': 'PostalAddress',
                streetAddress: '71-75 Shelton Street',
                addressLocality: 'London',
                postalCode: 'WC2H 9JQ',
                addressCountry: 'GB',
              },
            ],
            areaServed: {
              '@type': 'City',
              name: 'Dubai',
            },
            priceRange: '$$$$',
            knowsAbout: [
              'Luxury real estate',
              'Dubai property investment',
              'Off-plan property',
              'Golden Visa through real estate',
              'High-net-worth property advisory',
            ],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Real Estate Services',
              itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Luxury Property Brokerage' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private Advisory & Concierge' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Real Estate Investment & Syndication' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Property Management' } },
              ],
            },
            sameAs: [
              'https://www.instagram.com/blackoakdubai/',
              'https://ae.linkedin.com/company/blackoak-real-estate',
              'https://www.facebook.com/BlackOakRealEstate/',
              'https://www.tiktok.com/@blackoak.realestate',
              'https://www.youtube.com/@blackoakrealestate',
            ],
          }),
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(){
            var d=document.documentElement;
            if(d.hasAttribute('data-splash-enabled')
              && /^\\/((?:fr|ar)\\/)?$/.test(location.pathname)
              && !/blackoak-splash=/.test(document.cookie)){
              d.dataset.splash='pending';
              document.cookie='blackoak-splash=seen;path=/';
              window.__splashTimer=setTimeout(function(){ delete d.dataset.splash; }, ${splash.autoPlayDuration + 3000});
            }
          })();
        `,
        }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded"
      >
        {tCommon('skipToMainContent')}
      </a>
      <CurrencyProvider>
        <div id="app-shell">
          <Navbar />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
        </div>
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
