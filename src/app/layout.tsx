// The document shell (<html>, <body>, fonts, analytics) lives in
// [locale]/layout.tsx, where the language is known from the URL. Reading it
// here would mean asking next-intl for the request's locale, which forces
// every page to be rendered per request instead of being cached.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
