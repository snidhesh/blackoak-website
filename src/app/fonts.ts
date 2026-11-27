import { Figtree, Raleway, Noto_Sans_Arabic } from 'next/font/google';

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

/** Class names that expose the site's font CSS variables; goes on <html>. */
export const fontVariables = `${figtree.variable} ${raleway.variable} ${notoSansArabic.variable}`;
