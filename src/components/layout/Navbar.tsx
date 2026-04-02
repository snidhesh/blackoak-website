'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronDown, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';

interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavItem[];
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navigation: NavItem[] = [
    {
      label: t('aboutUs'),
      dropdown: [
        { label: t('whyBlackoak'), href: '/about/why-blackoak' },
        { label: t('ourTeam'), href: '/about/our-team' },
        { label: t('career'), href: '/career' },
      ],
    },
    { label: t('properties'), href: '/projects' },
    {
      label: t('neighbourhoods'),
      dropdown: [
        { label: t('neighbourhoodNames.emiratesHills'), href: '/neighbourhoods/emirates-hills' },
        { label: t('neighbourhoodNames.palmJumeirah'), href: '/neighbourhoods/palm-jumeirah' },
        { label: t('neighbourhoodNames.dubaiHillsEstate'), href: '/neighbourhoods/dubai-hills-estate' },
        { label: t('neighbourhoodNames.alBarari'), href: '/neighbourhoods/al-barari' },
        { label: t('neighbourhoodNames.downtownDubai'), href: '/neighbourhoods/downtown-dubai' },
        { label: t('neighbourhoodNames.difc'), href: '/neighbourhoods/difc' },
        { label: t('neighbourhoodNames.jumeirahGolfEstates'), href: '/neighbourhoods/jumeirah-golf-estates' },
        { label: t('neighbourhoodNames.jumeirahIslands'), href: '/neighbourhoods/jumeirah-islands' },
        { label: t('neighbourhoodNames.dubaiMarina'), href: '/neighbourhoods/dubai-marina' },
        { label: t('neighbourhoodNames.mohammedBinRashidCity'), href: '/neighbourhoods/mohammed-bin-rashid-city' },
        { label: t('neighbourhoodNames.cityWalk'), href: '/neighbourhoods/city-walk' },
        { label: t('neighbourhoodNames.businessBay'), href: '/neighbourhoods/business-bay' },
        { label: t('neighbourhoodNames.bluewaterIsland'), href: '/neighbourhoods/bluewaters-island' },
      ],
    },
    {
      label: t('insightsAndIntelligence'),
      dropdown: [
        { label: t('investors'), href: '/insights/investors' },
        { label: t('buyers'), href: '/insights/buyers' },
        { label: t('newsAndPress'), href: '/insights/news' },
      ],
    },
    { label: t('contact'), href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Pages with white/light backgrounds need a solid black navbar
  const p = pathname.replace(/\/$/, '') || '/';
  const needsSolidNav = p === '/projects' || p.startsWith('/insights/news') || p === '/career' || p === '/contact' || p === '/list-your-property' || p === '/privacy-policy' || p === '/disclaimer' || p === '/terms-of-service';

  const isActive = (item: NavItem): boolean => {
    if (item.href && p === item.href) return true;
    if (item.dropdown) {
      return item.dropdown.some(sub => sub.href && p.startsWith(sub.href));
    }
    return false;
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'bg-white shadow-md' : needsSolidNav ? 'bg-black' : 'bg-transparent'
        )}
      >
        <nav className="container-wide flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo-white.png"
              alt="BlackOak Real Estate"
              width={160}
              height={40}
              priority
              className={cn(
                'transition-all duration-300',
                scrolled && 'brightness-0'
              )}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-[12px] font-medium uppercase tracking-wider transition-colors',
                      scrolled
                        ? isActive(item) ? 'text-black' : 'text-gray-600 hover:text-black'
                        : isActive(item) ? 'text-white' : 'text-gray-300 hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-[12px] font-medium uppercase tracking-wider transition-colors',
                      scrolled
                        ? isActive(item) ? 'text-black' : 'text-gray-600 hover:text-black'
                        : isActive(item) ? 'text-white' : 'text-gray-300 hover:text-white'
                    )}
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    aria-expanded={activeDropdown === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown className={cn(
                      'w-3.5 h-3.5 transition-transform',
                      activeDropdown === item.label && 'rotate-180'
                    )} />
                  </button>
                )}

                {/* Dropdown */}
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full start-0 mt-0 py-2 bg-white rounded-md shadow-xl border border-gray-100 min-w-[240px] animate-slide-down">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href!}
                        className={cn(
                          'block px-4 py-2 text-sm transition-colors',
                          p === sub.href
                            ? 'text-black font-medium bg-gray-50'
                            : 'text-gray-600 hover:text-black hover:bg-gray-50'
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/list-your-property"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors',
                scrolled
                  ? 'border-gray-300 text-gray-600 hover:text-black hover:border-gray-400'
                  : 'border-gray-500 text-gray-300 hover:text-white hover:border-white'
              )}
            >
              {t('listYourProperty')}
            </Link>
            <CurrencySwitcher scrolled={scrolled} />
            <LanguageSwitcher scrolled={scrolled} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn('lg:hidden p-2', mobileOpen && 'invisible')}
            onClick={() => setMobileOpen(true)}
            aria-label={t('openMenu')}
          >
            <Menu className={cn('w-6 h-6', scrolled ? 'text-black' : 'text-white')} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} navigation={navigation} />
    </>
  );
}
