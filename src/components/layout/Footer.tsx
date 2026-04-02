'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/blackoakre', key: 'facebook' as const },
  { icon: Twitter, href: 'https://x.com/blackoakre', key: 'twitter' as const },
  { icon: Linkedin, href: 'https://linkedin.com/company/blackoakre', key: 'linkedin' as const },
  // { icon: MessageCircle, href: 'https://wa.me/97143989055', key: 'whatsapp' as const },
  { icon: Instagram, href: 'https://instagram.com/blackoakre', key: 'instagram' as const },
  { icon: Youtube, href: 'https://youtube.com/blackoakre', key: 'youtube' as const },
];

export default function Footer() {
  const t = useTranslations('footer');

  const footerColumns = [
    {
      title: t('columns.theCompany'),
      links: [
        { label: t('companyLinks.properties'), href: '/projects' },
        { label: t('companyLinks.whyBlackoak'), href: '/about/why-blackoak' },
        { label: t('companyLinks.ourTeam'), href: '/about/our-team' },
        { label: t('companyLinks.careers'), href: '/career' },
        { label: t('companyLinks.contact'), href: '/contact' },
      ],
    },
    {
      title: t('columns.neighbourhoods'),
      links: [
        { label: t('neighbourhoodLinks.emiratesHills'), href: '/neighbourhoods/emirates-hills' },
        { label: t('neighbourhoodLinks.palmJumeirah'), href: '/neighbourhoods/palm-jumeirah' },
        { label: t('neighbourhoodLinks.dubaiHillsEstate'), href: '/neighbourhoods/dubai-hills-estate' },
        { label: t('neighbourhoodLinks.alBarari'), href: '/neighbourhoods/al-barari' },
        { label: t('neighbourhoodLinks.downtownDubai'), href: '/neighbourhoods/downtown-dubai' },
        { label: t('neighbourhoodLinks.difc'), href: '/neighbourhoods/difc' },
        { label: t('neighbourhoodLinks.jumeirahGolfEstates'), href: '/neighbourhoods/jumeirah-golf-estates' },
        { label: t('neighbourhoodLinks.jumeirahIslands'), href: '/neighbourhoods/jumeirah-islands' },
        { label: t('neighbourhoodLinks.dubaiMarina'), href: '/neighbourhoods/dubai-marina' },
        { label: t('neighbourhoodLinks.mohammedBinRashidCity'), href: '/neighbourhoods/mohammed-bin-rashid-city' },
        { label: t('neighbourhoodLinks.cityWalk'), href: '/neighbourhoods/city-walk' },
        { label: t('neighbourhoodLinks.businessBay'), href: '/neighbourhoods/business-bay' },
        { label: t('neighbourhoodLinks.bluewaterIsland'), href: '/neighbourhoods/bluewaters-island' },
      ],
    },
    {
      title: t('columns.insightsAndIntelligence'),
      links: [
        { label: t('insightsLinks.investors'), href: '/insights/investors' },
        { label: t('insightsLinks.buyers'), href: '/insights/buyers' },
        { label: t('insightsLinks.newsAndPress'), href: '/insights/news' },
      ],
    },
  ];

  return (
    <footer className="bg-dark-900 text-white">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1 flex flex-col">
            <Link href="/">
              <Image
                src="/images/logo-white.png"
                alt="BlackOak Real Estate"
                width={150}
                height={40}
              />
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed italic">
              {t('tagline')}
            </p>
            {/* Awards */}
            <div className="mt-[48px] flex items-center gap-4">
              <Image
                src="/images/awards/luxury-lifestyle-2024.png"
                alt={t('awardsAlt.luxuryLifestyle')}
                width={85}
                height={125}
                className="object-contain"
              />
              <Image
                src="/images/awards/million-dollar-listing.png"
                alt={t('awardsAlt.millionDollarListing')}
                width={178}
                height={118}
                className="object-contain"
              />
            </div>
          </div>

          {/* Footer Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold tracking-wider mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Address & Contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider mb-4">{t('address')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">{t('offices.dubai.city')}</p>
                <p className="text-sm text-gray-400">{t('offices.dubai.line1')}</p>
                <p className="text-sm text-gray-400">{t('offices.dubai.line2')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t('offices.london.city')}</p>
                <p className="text-sm text-gray-400">{t('offices.london.line1')}</p>
                <p className="text-sm text-gray-400">{t('offices.london.line2')}</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold tracking-wider mt-6 mb-3">{t('contactTitle')}</h3>
            <div className="space-y-2">
              <a href="mailto:info@blackoak-re.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                info@blackoak-re.com
              </a>
              <a href="tel:+97143989055" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                +971 4 398 9055
              </a>
              <a
                href="https://wa.me/97143989055"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {t('socialLabels.whatsapp')}
              </a>
            </div>

            <h3 className="text-sm font-semibold tracking-wider mt-6 mb-3">{t('followUsTitle')}</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(`socialLabels.${social.key}`)}
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-wide py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link href="/terms-of-service" className="text-xs text-gray-500 hover:text-white transition-colors">
              {t('termsOfService')}
            </Link>
            <Link href="/disclaimer" className="text-xs text-gray-500 hover:text-white transition-colors">
              {t('disclaimer')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
