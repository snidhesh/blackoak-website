import type { Metadata } from 'next';
import { Figtree, Raleway } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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

export const metadata: Metadata = {
  title: {
    default: 'BlackOak Real Estate | Luxury Properties in Dubai',
    template: '%s | BlackOak Real Estate',
  },
  description:
    'A global luxury real estate firm delivering expert guidance, exclusive opportunities, and tailored investment services in Dubai.',
  keywords: [
    'Dubai real estate',
    'luxury properties',
    'Dubai investment',
    'Palm Jumeirah',
    'Emirates Hills',
    'property investment',
    'BlackOak',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'BlackOak Real Estate',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${raleway.variable}`}>
      <body className="font-sans antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        {/* <WhatsAppButton /> */}
      </body>
    </html>
  );
}
