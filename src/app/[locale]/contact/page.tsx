import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import ContactForm from '@/components/sections/ContactForm';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['contact BlackOak Real Estate', 'Dubai real estate agent contact', 'luxury property enquiry Dubai', 'Dubai Marina real estate office', 'London Dubai property agent'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/contact/' : `https://blackoak-re.com/${locale}/contact/`,
      languages: { en: 'https://blackoak-re.com/contact/', fr: 'https://blackoak-re.com/fr/contact/', ar: 'https://blackoak-re.com/ar/contact/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/contact/' : `https://blackoak-re.com/${locale}/contact/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

const offices = [
  {
    city: 'Dubai',
    image: '/images/contact/dubai-map.png',
    address: 'Office 1406, Marina Plaza, Dubai Marina, Dubai, United Arab Emirates',
    phone: '+971 (0) 4 398 9055',
    phoneHref: 'tel:+97143989055',
    email: 'info@blackoak-re.com',
    mapLink: 'https://maps.google.com/?q=Marina+Plaza+Dubai+Marina',
  },
  {
    city: 'London',
    image: '/images/contact/london-map.png',
    address: '71-75 Shelton Street London WC2H 9JQ United Kingdom',
    phone: '+44 (0) 203 905 5501',
    phoneHref: 'tel:+442039055501',
    email: 'info@blackoak-re.com',
    mapLink: 'https://maps.google.com/?q=71-75+Shelton+Street+London+WC2H+9JQ',
  },
];

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://blackoak-re.com/#organization',
  name: 'BlackOak Real Estate',
  image: 'https://blackoak-re.com/images/logo-white.png',
  url: 'https://blackoak-re.com',
  telephone: '+971 4 398 9055',
  email: 'info@blackoak-re.com',
  priceRange: 'AED 1,000,000 - AED 200,000,000+',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Office 1406, Marina Plaza, Dubai Marina',
    addressLocality: 'Dubai',
    addressRegion: 'Dubai',
    addressCountry: 'AE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 25.0762,
    longitude: 55.1386,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '16:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/blackoak_re/',
    'https://www.linkedin.com/company/blackoakrealestate/',
    'https://www.facebook.com/BlackOakRE/',
    'https://www.youtube.com/@BlackOakRealEstate',
  ],
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 25.1864,
      longitude: 55.2662,
    },
    geoRadius: '100000',
  },
};

export default async function ContactPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.contact' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tCommon('breadcrumbs.home'), item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('headerLabel'), item: locale === 'en' ? 'https://blackoak-re.com/contact/' : `https://blackoak-re.com/${locale}/contact/` },
    ],
  };

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact BlackOak Real Estate',
    description: 'Contact BlackOak Real Estate for luxury property enquiries in Dubai.',
    url: locale === 'en' ? 'https://blackoak-re.com/contact/' : `https://blackoak-re.com/${locale}/contact/`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'RealEstateAgent',
      name: 'BlackOak Real Estate',
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
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* Header Label + Heading */}
      <section className="pt-[156px] pb-8">
        <div className="container-narrow text-center">
          <SectionLabel>{t('headerLabel')}</SectionLabel>
          <h1 className="mt-5 text-[50px] font-light leading-[1.2] text-black">
            {t('heading').split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <Image
          src="/images/contact/hero.jpg"
          alt={t('heroAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-[rgba(7,35,75,0.9)] to-transparent" />
      </section>

      {/* Locations */}
      <section className="py-20">
        <div className="container-narrow text-center mb-12">
          <AnimateOnScroll>
            <SectionLabel>{t('locationsLabel')}</SectionLabel>
            <SectionHeading
              title={t('locationsHeading')}
              className="mt-5 max-w-[538px] mx-auto"
            />
          </AnimateOnScroll>
        </div>

        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {offices.map((office, i) => (
              <AnimateOnScroll key={office.city} delay={i * 0.15}>
                <div className="border-t border-b border-[#ccc] h-auto md:h-[308px] flex flex-col md:flex-row">
                  {/* Map Image */}
                  <div className="relative w-full md:w-[320px] h-[200px] md:h-full shrink-0 overflow-hidden m-5 md:my-[29px] md:mx-5">
                    <Image
                      src={office.image}
                      alt={`${office.city} office location`}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-6 px-5 pb-5 md:p-0 md:pt-[49px]">
                    <h2 className="text-[18px] font-normal uppercase text-black">
                      {office.city}
                    </h2>
                    <div className="flex flex-col gap-[10px] text-[16px] font-light leading-[28px] text-[#5f6368]">
                      <p className="max-w-[279px]">{office.address}</p>
                      <a href={office.phoneHref} className="hover:text-black transition-colors">
                        {office.phone}
                      </a>
                      <a href={`mailto:${office.email}`} className="hover:text-black transition-colors">
                        {office.email}
                      </a>
                    </div>
                    <a
                      href={office.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] font-medium uppercase text-black underline tracking-wider"
                    >
                      {tCommon('viewLocation')}
                    </a>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-[#f0f3f8]">
        <div className="container-narrow">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <SectionLabel>{t('formLabel')}</SectionLabel>
              <SectionHeading
                title={t('formHeading')}
                className="mt-5 max-w-[434px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <div className="max-w-[864px] mx-auto">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
