import type { Metadata } from 'next';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Page Not Found | BlackOak Real Estate',
  robots: { index: false, follow: false },
};

// Shown for URLs that match no route at all. It sits outside [locale], so it
// brings its own document shell.
export default function RootNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="font-sans antialiased">
        <section className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-8xl font-bold text-gray-200 mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 border border-black text-black text-sm font-medium tracking-wider uppercase hover:bg-black hover:text-white transition-colors"
            >
              RETURN TO HOMEPAGE
            </a>
          </div>
        </section>
      </body>
    </html>
  );
}
