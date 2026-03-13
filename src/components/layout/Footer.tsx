import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

const footerColumns = [
  {
    title: 'THE COMPANY',
    links: [
      { label: 'Projects', href: '/projects' },
      { label: 'Why BlackOak', href: '/about/why-blackoak' },
      { label: 'Our Team', href: '/about/our-team' },
      { label: 'Careers', href: '/career' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'NEIGHBOURHOODS',
    links: [
      { label: 'Emirates Hills', href: '/neighbourhoods/emirates-hills' },
      { label: 'Palm Jumeirah', href: '/neighbourhoods/palm-jumeirah' },
      { label: 'Dubai Hills Estate', href: '/neighbourhoods/dubai-hills-estate' },
      { label: 'Al Barari', href: '/neighbourhoods/al-barari' },
      { label: 'Downtown Dubai', href: '/neighbourhoods/downtown-dubai' },
      { label: 'Dubai International Financial Centre (DIFC)', href: '/neighbourhoods/difc' },
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
    title: 'INSIGHTS & OPPORTUNITIES',
    links: [
      { label: 'Investors', href: '/insights/investors' },
      { label: 'Buyers', href: '/insights/buyers' },
      { label: 'News & Press', href: '/insights/news' },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/blackoakre', label: 'Facebook' },
  { icon: Twitter, href: 'https://x.com/blackoakre', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/blackoakre', label: 'LinkedIn' },
  // { icon: MessageCircle, href: 'https://wa.me/97143989055', label: 'WhatsApp' },
  { icon: Instagram, href: 'https://instagram.com/blackoakre', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/blackoakre', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-white">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Image
                src="/images/logo-white.png"
                alt="BlackOak Real Estate"
                width={150}
                height={40}
              />
            </Link>
            <p className="mt-4 text-sm text-gray-400 leading-relaxed">
              A global luxury real estate firm delivering expert guidance, exclusive opportunities, and tailored investment services.
            </p>
            {/* Awards */}
            <div className="mt-6 flex items-center gap-4">
              <Image
                src="/images/awards/luxury-lifestyle-2024.png"
                alt="Luxury Lifestyle Winner 2024"
                width={85}
                height={125}
                className="object-contain"
              />
              <Image
                src="/images/awards/million-dollar-listing.png"
                alt="Million Dollar Listing"
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
            <h3 className="text-sm font-semibold tracking-wider mb-4">ADDRESS</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Dubai</p>
                <p className="text-sm text-gray-400">Marina Plaza, Office 1406, Dubai Marina</p>
                <p className="text-sm text-gray-400">Dubai, UAE</p>
              </div>
              <div>
                <p className="text-sm font-medium">London</p>
                <p className="text-sm text-gray-400">71-75 Shelton Street, London, WC2H 9JQ,</p>
                <p className="text-sm text-gray-400">United Kingdom</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold tracking-wider mt-6 mb-3">CONTACT</h3>
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

            <h3 className="text-sm font-semibold tracking-wider mt-6 mb-3">FOLLOW US</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
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
            &copy; 2026 by BlackOak Real Estate. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-xs text-gray-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/disclaimer" className="text-xs text-gray-500 hover:text-white transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
