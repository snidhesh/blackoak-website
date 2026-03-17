'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileMenu from './MobileMenu';

interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'About Us',
    dropdown: [
      { label: 'Why BlackOak', href: '/about/why-blackoak' },
      { label: 'Our Team', href: '/about/our-team' },
      { label: 'Career', href: '/career' },
    ],
  },
  { label: 'Projects', href: '/projects' },
  {
    label: 'Neighbourhoods',
    dropdown: [
      { label: 'Emirates Hills', href: '/neighbourhoods/emirates-hills' },
      { label: 'Palm Jumeirah', href: '/neighbourhoods/palm-jumeirah' },
      { label: 'Dubai Hills Estate', href: '/neighbourhoods/dubai-hills-estate' },
      { label: 'Al Barari', href: '/neighbourhoods/al-barari' },
      { label: 'Downtown Dubai', href: '/neighbourhoods/downtown-dubai' },
      { label: 'DIFC', href: '/neighbourhoods/difc' },
      { label: 'Jumeirah Golf Estates', href: '/neighbourhoods/jumeirah-golf-estates' },
      { label: 'Jumeirah Islands', href: '/neighbourhoods/jumeirah-islands' },
      { label: 'Dubai Marina', href: '/neighbourhoods/dubai-marina' },
      { label: 'Mohammed Bin Rashid City', href: '/neighbourhoods/mohammed-bin-rashid-city' },
      { label: 'City Walk', href: '/neighbourhoods/city-walk' },
      { label: 'Business Bay', href: '/neighbourhoods/business-bay' },
      { label: 'Bluewaters Island', href: '/neighbourhoods/bluewaters-island' },
    ],
  },
  {
    label: 'Insights & Intelligence',
    dropdown: [
      { label: 'Investors', href: '/insights/investors' },
      { label: 'Buyers', href: '/insights/buyers' },
      { label: 'News & Press', href: '/insights/news' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

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
  const needsSolidNav = p === '/projects' || p.startsWith('/insights/news') || p === '/career' || p === '/contact';

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
                  <div className="absolute top-full left-0 mt-0 py-2 bg-white rounded-md shadow-xl border border-gray-100 min-w-[240px] animate-slide-down">
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
              href="/contact"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors',
                scrolled
                  ? 'border-gray-300 text-gray-600 hover:text-black hover:border-gray-400'
                  : 'border-gray-500 text-gray-300 hover:text-white hover:border-white'
              )}
            >
              LIST YOUR PROPERTY
            </Link>
            <a
              href="https://wa.me/97143989055"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors',
                scrolled
                  ? 'border-gray-300 text-gray-600 hover:text-black hover:border-gray-400'
                  : 'border-gray-500 text-gray-300 hover:text-white hover:border-white'
              )}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WHATSAPP
            </a>
            <button
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors',
                scrolled
                  ? 'border-gray-300 text-gray-600 hover:text-black hover:border-gray-400'
                  : 'border-gray-500 text-gray-300 hover:text-white hover:border-white'
              )}
            >
              <Globe className="w-4 h-4" />
              EN
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <X className={cn('w-6 h-6', scrolled ? 'text-black' : 'text-white')} />
            ) : (
              <Menu className={cn('w-6 h-6', scrolled ? 'text-black' : 'text-white')} />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} navigation={navigation} />
    </>
  );
}
