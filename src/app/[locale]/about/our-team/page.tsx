import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getTeam } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import TeamDirectory from '@/components/sections/TeamDirectory';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.ourTeam' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Dubai real estate team', 'luxury property consultants Dubai', 'real estate advisors Dubai', 'property specialists UAE', 'BlackOak team'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/about/our-team/' : `https://blackoak-re.com/${locale}/about/our-team/`,
      languages: { en: 'https://blackoak-re.com/about/our-team/', fr: 'https://blackoak-re.com/fr/about/our-team/', ar: 'https://blackoak-re.com/ar/about/our-team/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/about/our-team/' : `https://blackoak-re.com/${locale}/about/our-team/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

export default async function OurTeamPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const t = await getTranslations('pages.about.ourTeam');
  const team = getTeam(locale);
  const partners = team.filter((m) => m.category === 'partner');
  const realEstateTeam = team.filter((m) => m.category === 'real-estate');
  const creativeTeam = team.filter((m) => m.category === 'creative-ops');

  const SITE = 'https://blackoak-re.com';
  const teamPageUrl = locale === 'en' ? `${SITE}/about/our-team/` : `${SITE}/${locale}/about/our-team/`;
  const orgId = `${SITE}/#organization`;

  const personSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const persons = team.map((member) => {
    const personId = `${teamPageUrl}#${personSlug(member.name)}`;
    const p: Record<string, unknown> = {
      '@type': 'Person',
      '@id': personId,
      name: member.name,
      jobTitle: member.title,
      worksFor: { '@id': orgId },
    };
    if (member.image) {
      p.image = {
        '@type': 'ImageObject',
        url: `${SITE}${member.image}`,
        width: 325,
        height: 406,
      };
    }
    if (member.bio) p.description = member.bio;
    if (member.email) p.email = member.email;
    if (member.phone) p.telephone = member.phone;
    if (member.linkedIn) p.sameAs = [member.linkedIn];
    return p;
  });

  const teamJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'BlackOak Real Estate',
        url: SITE,
        logo: `${SITE}/images/logo-white.png`,
        inLanguage: locale,
        employee: persons.map((p) => ({ '@id': p['@id'] })),
      },
      ...persons,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamJsonLd) }}
      />
      {/* Hero / Intro */}
      <section className="pt-32 pb-10 bg-black">
        <div className="container-wide text-center">
          <AnimateOnScroll>
            <SectionLabel light>{t('label')}</SectionLabel>
            <h1 className="text-4xl md:text-[50px] font-light leading-tight text-white mt-5">
              {t('heading')}
            </h1>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Description */}
      <section className="py-12">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center max-w-[983px] mx-auto text-gray-500 text-base leading-7 tracking-wide space-y-6">
              <p>{t('descriptionP1')}</p>
              <p>
                {t('descriptionP2Prefix')}{' '}
                <Link href="tel:+97143989055" className="font-bold text-black">
                  {t('descriptionP2Phone')}
                </Link>{' '}
                {t('descriptionP2Middle')}{' '}
                <Link href="/contact" className="font-bold text-black">
                  {t('descriptionP2ContactLink')}
                </Link>{' '}
                {t('descriptionP2Suffix')}
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <TeamDirectory
        partners={partners}
        realEstateTeam={realEstateTeam}
        creativeTeam={creativeTeam}
        creativeTeamTitle={t('creativeAndOpsTeam')}
      />
    </>
  );
}
