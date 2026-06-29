import Script from 'next/script';
import { Figtree, Raleway, Noto_Sans_Arabic } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

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

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-noto-arabic',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${figtree.variable} ${raleway.variable} ${notoSansArabic.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://studio.blackoak-re.com" />
        <link rel="preconnect" href="https://static.shared.propertyfinder.ae" />
        <link rel="dns-prefetch" href="https://studio.blackoak-re.com" />
        <link rel="dns-prefetch" href="https://static.shared.propertyfinder.ae" />
      </head>
      {GTM_ID && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      )}
      <body className="font-sans antialiased">
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
