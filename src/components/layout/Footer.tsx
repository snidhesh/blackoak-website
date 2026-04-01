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
