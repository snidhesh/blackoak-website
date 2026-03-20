import type { Metadata } from 'next';
import { Figtree, Raleway } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import splash from '@/content/splash.json';
// import WhatsAppButton from '@/components/layout/WhatsAppButton';

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
});

const BASE_URL = 'https://blackoak-re.com';

export const metadata: Metadata = {
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
    locale: 'en_AE',
    url: BASE_URL + '/',
    siteName: 'BlackOak Real Estate',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'BlackOak Real Estate - Luxury Properties in Dubai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@blackoakrealestate',
  },
  alternates: {
    canonical: BASE_URL + '/',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${raleway.variable}`}
      {...(splash.enabled ? { 'data-splash-enabled': '' } : {})}
    >
      <body className="font-sans antialiased">
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
              sameAs: [
                'https://www.instagram.com/blackoakrealestate',
                'https://www.linkedin.com/company/blackoakrealestate',
              ],
            }),
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var d=document.documentElement;
            if(d.hasAttribute('data-splash-enabled')
              && location.pathname==='/'
              && !/blackoak-splash=/.test(document.cookie)){
              d.dataset.splash='pending';
              document.cookie='blackoak-splash=seen;path=/';
              window.__splashTimer=setTimeout(function(){ delete d.dataset.splash; }, ${splash.autoPlayDuration + 3000});
            }
          })();
        `}} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded">
          Skip to main content
        </a>
        <div id="app-shell">
          <Navbar />
          <main id="main-content" className="min-h-screen">{children}</main>
          <Footer />
          {/* <WhatsAppButton /> */}
        </div>
      </body>
    </html>
  );
}
